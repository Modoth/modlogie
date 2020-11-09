using Autofac;
using Modlogie.Infrastructure.External;

namespace Modlogie.Api
{
    public class AutofacDevelopmentModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<DevelopmentEmailService>().AsImplementedInterfaces();
        }
    }
}