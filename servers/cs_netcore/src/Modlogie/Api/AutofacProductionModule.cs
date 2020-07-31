using System;
using System.Reflection;
using Autofac;
using Modlogie.Api.Common;
using Modlogie.Domain;
using Modlogie.Infrastructure.Data;
using Modlogie.Infrastructure.External;

namespace Modlogie.Api
{
    public class AutofacProductionModule : Autofac.Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<EmailService>().AsImplementedInterfaces();
        }
    }
}