using Autofac;
using Modlogie.Infrastructure.External;

namespace Modlogie.Api
{
    public class AutofacProductionModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<EmailService>().AsImplementedInterfaces();
        }
    }
}