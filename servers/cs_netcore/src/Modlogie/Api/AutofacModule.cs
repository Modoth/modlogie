using System;
using System.Reflection;
using Autofac;
using Modlogie.Api.Common;
using Modlogie.Domain;
using Modlogie.Infrastructure.Data;
using Module = Autofac.Module;

namespace Modlogie.Api
{
    public class AutofacModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            var asm = Assembly.GetAssembly(typeof(AutofacModule));

            bool IsSingleton(Type type)
            {
                return type.Name.EndsWith("Singleton");
            }

            var domainServiceNameSpace = typeof(IAccountValidationService).Namespace;

            bool IsDomainService(Type type)
            {
                return type.Namespace == domainServiceNameSpace;
            }

            builder.RegisterAssemblyTypes(asm!)
                .Where(t => IsSingleton(t) && IsDomainService(t))
                .AsImplementedInterfaces();

            builder.RegisterAssemblyTypes(asm)
                .Where(t => !IsSingleton(t) && IsDomainService(t))
                .AsImplementedInterfaces().SingleInstance();

            builder.RegisterType<LocalFileContentService>().AsImplementedInterfaces();
            builder.RegisterType<LoginUserService>().AsImplementedInterfaces();
            builder.RegisterType<FileQueryCompileServiceSingleton>().AsImplementedInterfaces().SingleInstance();

            bool IsEntityService(Type type)
            {
                return type.Name.EndsWith("EntityService");
            }

            builder.RegisterAssemblyTypes(asm)
                .Where(IsEntityService)
                .AsImplementedInterfaces();
        }
    }
}