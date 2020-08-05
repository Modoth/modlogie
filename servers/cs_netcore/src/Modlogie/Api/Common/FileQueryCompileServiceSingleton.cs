
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Cryptography;
using System.Text;
using Modlogie.Api.Files;

namespace Modlogie.Api.Common
{
    using static Modlogie.Api.Files.Condition.Types;
    using ExpNode = Expression<Func<Domain.Models.File, bool>>;

    public class ExpressionParameterReplacer : ExpressionVisitor
    {
        private IDictionary<ParameterExpression, ParameterExpression> ParameterReplacements { get; set; }

        public ExpressionParameterReplacer
        (IList<ParameterExpression> fromParameters, IList<ParameterExpression> toParameters)
        {
            ParameterReplacements = new Dictionary<ParameterExpression, ParameterExpression>();

            for (int i = 0; i != fromParameters.Count && i != toParameters.Count; i++)
            { ParameterReplacements.Add(fromParameters[i], toParameters[i]); }
        }

        protected override Expression VisitParameter(ParameterExpression file)
        {
            ParameterExpression replacement;

            if (ParameterReplacements.TryGetValue(file, out replacement))
            { file = replacement; }

            return base.VisitParameter(file);
        }
    }

    public static class ExpressionUtils
    {
        public static Expression<Func<T, Boolean>> OrElse<T>(this Expression<Func<T, Boolean>> left, Expression<Func<T, Boolean>> right)
        {
            Expression<Func<T, Boolean>> combined = Expression.Lambda<Func<T, Boolean>>(
                Expression.OrElse(
                    left.Body,
                    new ExpressionParameterReplacer(right.Parameters, left.Parameters).Visit(right.Body)
                    ), left.Parameters);

            return combined;
        }

        public static Expression<Func<T, Boolean>> AndAlso<T>(this Expression<Func<T, Boolean>> left, Expression<Func<T, Boolean>> right)
        {
            Expression<Func<T, Boolean>> combined = Expression.Lambda<Func<T, Boolean>>(
                Expression.AndAlso(
                    left.Body,
                    new ExpressionParameterReplacer(right.Parameters, left.Parameters).Visit(right.Body)
                    ), left.Parameters);

            return combined;
        }
        public static Expression<Func<T, Boolean>> Not<T>(this Expression<Func<T, Boolean>> left)
        {
            Expression<Func<T, Boolean>> combined = Expression.Lambda<Func<T, Boolean>>(
                Expression.Not(
                    left.Body
                    ), left.Parameters);

            return combined;
        }
    }
    public class FileQueryCompileServiceSingleton : IFileQueryCompileService
    {
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
                        var childrens = cond.Children.Select(c => this.GetCondition(c)).ToArray();
                        var andExp = childrens[0];
                        for (var i = 1; i < childrens.Length; i++)
                        {
                            andExp = andExp.AndAlso(childrens[i]);
                        }
                        return andExp;
                    }
                case ConditionType.Or:
                    {
                        if (cond.Children == null || cond.Children.Count == 0)
                        {
                            throw new Exception();

                        }
                        var childrens = cond.Children.Select(c => this.GetCondition(c)).ToArray();
                        var orExp = childrens[0];
                        for (var i = 1; i < childrens.Length; i++)
                        {
                            orExp = orExp.OrElse(childrens[i]);
                        }
                        return orExp;
                    }
                case ConditionType.Not:
                    {
                        if (cond.Children == null || cond.Children.Count == 0)
                        {
                            throw new Exception();

                        }
                        var childrens = cond.Children.Select(c => this.GetCondition(c)).ToArray();
                        var andExp = childrens[0];
                        for (var i = 1; i < childrens.Length; i++)
                        {
                            andExp = andExp.OrElse(childrens[i]);
                        }
                        return andExp.Not();
                    }
            }
            if (String.IsNullOrWhiteSpace(cond.Prop))
            {
                throw new Exception();

            }
            if (cond.Type == ConditionType.Has)
            {
                return file => file.FileTags.Any(t => t.Tag!.Name == cond.Prop);
            }
            if (String.IsNullOrWhiteSpace(cond.Value))
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
                        return file => file.FileTags.Any(t => t.Tag!.Name == cond.Prop && t.Value != null && t.Value.Contains(cond.Value));
                    }
                case ConditionType.StartsWith:
                    {
                        var propContain = GetPropStartsWith(cond.Prop!, cond.Value!);
                        if (propContain != null)
                        {
                            return propContain!;
                        }
                        return file => file.FileTags.Any(t => t.Tag!.Name == cond.Prop && t.Value != null && t.Value.StartsWith(cond.Value));
                    }

            }
            throw new Exception();
        }

        private ExpNode GetPropContain(string prop, string value)
        {
            switch (prop)
            {
                case nameof(Domain.Models.File.Name):
                    return file => file.Name!.Contains(value);
                case nameof(Domain.Models.File.Path):
                    return file => file.Path!.Contains(value);
            }
            return null;

        }

        private ExpNode GetPropStartsWith(string prop, string value)
        {
            switch (prop)
            {
                case nameof(Domain.Models.File.Name):
                    return file => file.Name!.StartsWith(value);
                case nameof(Domain.Models.File.Path):
                    return file => file.Path!.StartsWith(value);
            }
            return null;

        }


        private ExpNode GetPropEqual(string prop, string value)
        {
            switch (prop)
            {
                case nameof(Domain.Models.File.Id):
                    return file => file.Id == (Guid.Parse(value));
                case nameof(Domain.Models.File.Name):
                    return file => file.Name == value;
                case nameof(Domain.Models.File.Type):
                    return file => file.Type == (int.Parse(value));
                case nameof(Domain.Models.File.Parent) + "Id":
                    return file => (file.Parent != null) && (file.Parent.Id == Guid.Parse(value));
            }
            return null;

        }
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
                    ExpNode condExp = GetCondition(query.Where);
                    exp = exp.AndAlso(condExp);
                }
                return exp!;
            }
            catch
            {
                throw new Exception();
            }

        }
    }
}