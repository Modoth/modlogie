using System;
using System.Reflection;
using Autofac;
using Modlogie.Api.Common;
using Modlogie.Domain;
using Modlogie.Infrastructure.Data;

namespace Modlogie.Api
{
    public class AutofacModule : Autofac.Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            var asm = Assembly.GetAssembly(typeof(AutofacModule));
            Func<Type, bool> isSingleton = (type) => type.Name.EndsWith("Singleton");

            var domainServiceNameSpace = typeof(IAccontValidationService).Namespace;
            Func<Type, bool> isDomainService = (type) => type.Namespace == domainServiceNameSpace;
            builder.RegisterAssemblyTypes(asm)
                .Where(t => isSingleton(t) && isDomainService(t))
                .AsImplementedInterfaces();

            builder.RegisterAssemblyTypes(asm)
                            .Where(t => !isSingleton(t) && isDomainService(t))
                            .AsImplementedInterfaces().SingleInstance();

            builder.RegisterType<LocalFileContentService>().AsImplementedInterfaces();
            builder.RegisterType<LoginUserService>().AsImplementedInterfaces();
            builder.RegisterType<FileQueryCompileServiceSingleton>().AsImplementedInterfaces().SingleInstance();

            Func<Type, bool> isEntityService = (type) => type.Name.EndsWith("EntityService");
            builder.RegisterAssemblyTypes(asm)
                .Where(t => isEntityService(t))
                .AsImplementedInterfaces();
        }
    }
}