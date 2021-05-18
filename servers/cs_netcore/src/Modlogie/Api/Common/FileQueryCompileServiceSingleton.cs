using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Modlogie.Api.Files;
using File = Modlogie.Domain.Models.File;

namespace Modlogie.Api.Common
{
    using static Condition.Types;
    using ExpNode = Expression<Func<File, bool>>;

    public class ExpressionParameterReplacer : ExpressionVisitor
    {
        public ExpressionParameterReplacer
            (IList<ParameterExpression> fromParameters, IList<ParameterExpression> toParameters)
        {
            ParameterReplacements = new Dictionary<ParameterExpression, ParameterExpression>();

            for (var i = 0; i != fromParameters.Count && i != toParameters.Count; i++)
            {
                ParameterReplacements.Add(fromParameters[i], toParameters[i]);
            }
        }

        private IDictionary<ParameterExpression, ParameterExpression> ParameterReplacements { get; }

        protected override Expression VisitParameter(ParameterExpression file)
        {
            if (ParameterReplacements.TryGetValue(file, out var replacement))
            {
                file = replacement;
            }

            return base.VisitParameter(file);
        }
    }

    public static class ExpressionUtils
    {
        public static Expression<Func<T, bool>> OrElse<T>(this Expression<Func<T, bool>> left,
            Expression<Func<T, bool>> right)
        {
            var combined = Expression.Lambda<Func<T, bool>>(
                Expression.OrElse(
                    left.Body,
                    new ExpressionParameterReplacer(right.Parameters, left.Parameters).Visit(right.Body)!
                ), left.Parameters);

            return combined;
        }

        public static Expression<Func<T, bool>> AndAlso<T>(this Expression<Func<T, bool>> left,
            Expression<Func<T, bool>> right)
        {
            var combined = Expression.Lambda<Func<T, bool>>(
                Expression.AndAlso(
                    left.Body,
                    new ExpressionParameterReplacer(right.Parameters, left.Parameters).Visit(right.Body)!
                ), left.Parameters);

            return combined;
        }

        public static Expression<Func<T, bool>> Not<T>(this Expression<Func<T, bool>> left)
        {
            var combined = Expression.Lambda<Func<T, bool>>(
                Expression.Not(
                    left.Body
                ), left.Parameters);

            return combined;
        }
    }

    public class FileQueryCompileServiceSingleton : IFileQueryCompileService
    {
        public ExpNode Compile(IEnumerable<FileParentId> ins, Query query)
        {
            try
            {
                ExpNode exp = file => true;
                if (ins != null)
                {
                    exp = default;
                    foreach (var p in ins)
                    {
                        ExpNode inExp = file => file.Path!.StartsWith(p.Path);
                        exp = exp == null ? inExp : exp.OrElse(inExp);
                    }
                }

                if (exp == null)
                {
                    throw new Exception();
                }

                if (query == null)
                {
                    return exp!;
                }

                if (query.Where != null)
                {
                    var condExp = GetCondition(query.Where);
                    exp = exp.AndAlso(condExp);
                }

                return exp!;
            }
            catch
            {
                throw new Exception();
            }
        }

        private ExpNode GetCondition(Condition cond)
        {
            switch (cond.Type)
            {
                case ConditionType.And:
                {
                    if (cond.Children == null || cond.Children.Count == 0)
                    {
                        throw new Exception();
                    }

                    var children = cond.Children.Select(GetCondition).ToArray();
                    var andExp = children[0];
                    for (var i = 1; i < children.Length; i++)
                    {
                        andExp = andExp.AndAlso(children[i]);
                    }

                    return andExp;
                }
                case ConditionType.Or:
                {
                    if (cond.Children == null || cond.Children.Count == 0)
                    {
                        throw new Exception();
                    }

                    var children = cond.Children.Select(GetCondition).ToArray();
                    var orExp = children[0];
                    for (var i = 1; i < children.Length; i++)
                    {
                        orExp = orExp.OrElse(children[i]);
                    }

                    return orExp;
                }
                case ConditionType.Not:
                {
                    if (cond.Children == null || cond.Children.Count == 0)
                    {
                        throw new Exception();
                    }

                    var children = cond.Children.Select(GetCondition).ToArray();
                    var andExp = children[0];
                    for (var i = 1; i < children.Length; i++)
                    {
                        andExp = andExp.OrElse(children[i]);
                    }

                    return andExp.Not();
                }
            }

            if (string.IsNullOrWhiteSpace(cond.Prop))
            {
                throw new Exception();
            }

            if (cond.Type == ConditionType.Has)
            {
                return file => file.FileTags.Any(t => t.Tag!.Name == cond.Prop);
            }

            if (string.IsNullOrWhiteSpace(cond.Value))
            {
                throw new Exception();
            }

            switch (cond.Type)
            {
                case ConditionType.Equal:
                {
                    var propEqual = GetPropEqual(cond.Prop!, cond.Value!);
                    if (propEqual != null)
                    {
                        return propEqual!;
                    }

                    return file => file.FileTags.Any(t => t.Tag!.Name == cond.Prop && t.Value == cond.Value);
                }
                case ConditionType.Contains:
                {
                    var propContain = GetPropContain(cond.Prop!, cond.Value!);
                    if (propContain != null)
                    {
                        return propContain!;
                    }

                    return file => file.FileTags.Any(t =>
                        t.Tag!.Name == cond.Prop && t.Value != null && t.Value.Contains(cond.Value));
                }
                case ConditionType.StartsWith:
                {
                    var propContain = GetPropStartsWith(cond.Prop!, cond.Value!);
                    if (propContain != null)
                    {
                        return propContain!;
                    }

                    return file => file.FileTags.Any(t =>
                        t.Tag!.Name == cond.Prop && t.Value != null && t.Value.StartsWith(cond.Value));
                }
            }

            throw new Exception();
        }

        private ExpNode GetPropContain(string prop, string value)
        {
            switch (prop)
            {
                case nameof(File.Name):
                    return file => file.Name!.Contains(value);
                case nameof(File.Path):
                    return file => file.Path!.Contains(value);
            }

            return null;
        }

        private ExpNode GetPropStartsWith(string prop, string value)
        {
            switch (prop)
            {
                case nameof(File.Name):
                    return file => file.Name!.StartsWith(value);
                case nameof(File.Path):
                    return file => file.Path!.StartsWith(value);
            }

            return null;
        }


        private ExpNode GetPropEqual(string prop, string value)
        {
            switch (prop)
            {
                case nameof(File.Id):
                    return file => file.Id == Guid.Parse(value);
                case nameof(File.Weight):
                    return file => file.Weight == Int32.Parse(value);
                case nameof(File.Name):
                    return file => file.Name == value;
                case nameof(File.Path):
                    return file => file.Path == value;
                case nameof(File.Type):
                    return file => file.Type == int.Parse(value);
                case nameof(File.Private):
                    return file => file.Private == (bool.Parse(value) ? 1u : 2u);
                case nameof(File.AdditionalType):
                    return file => file.AdditionalType == int.Parse(value);
                case nameof(File.Parent) + "Id":
                    return file => file.Parent != null && file.Parent.Id == Guid.Parse(value);
            }

            return null;
        }
    }
}