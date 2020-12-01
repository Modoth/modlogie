using System;
using System.IO;
using Autofac;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Modlogie.Api.Services;
using Modlogie.Infrastructure.Data;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

namespace Modlogie.Api
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            Configuration = configuration;
            IsDevelopment = env.IsDevelopment();
        }

        private IConfiguration Configuration { get; }

        private bool IsDevelopment { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ModlogieContext>(options =>
            {
                options.UseMySql(Configuration.GetMySqlConnectionString(), mySqlOptions => mySqlOptions
                    .ServerVersion(new Version(10, 3, 12), ServerType.MariaDb));
            });
            services.AddDistributedRedisCache(options =>
            {
                options.Configuration = Configuration.GetValue<string>("Cache:RedisConfiguration");
            });
            services.AddGrpc(options =>
            {
                var maxFile = Configuration.GetValue<int>("File:MaxSize");
                if (maxFile > 0) options.MaxReceiveMessageSize = maxFile * 1024 * 1024;
            });
            services.AddDistributedSession(options =>
            {
                options.CookieName = Configuration.GetValue<string>("Session:Cookie:Name");
                options.IdleTimeout = TimeSpan.FromSeconds(Configuration.GetValue<int>("Session:IdleTimeout"));
            });
            services.Configure<LocalFileContentServiceOptions>(Configuration.GetSection("File"));
            services.AddMvc();
        }

        public void ConfigureContainer(ContainerBuilder builder)
        {
            builder.RegisterModule(new AutofacModule());
            if (IsDevelopment)
                builder.RegisterModule(new AutofacDevelopmentModule());
            else
                builder.RegisterModule(new AutofacProductionModule());
        }

        private bool UpdateDbAndExit(ILogger logger)
        {
            var scriptsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory!, "sqls");
            var dbUpdater = new DbUpdater(logger,
                Configuration.GetMySqlConnectionString(),
                Configuration.GetValue<string>("ConnectionProps:Database"),
                Configuration.GetMySqlConnectionString(true),
                scriptsPath);
            var updateTask = dbUpdater.UpdateAsync();
            updateTask.Wait();
            return Configuration.GetValue<bool>("Execute:UpdateDbOnly");
        }

        public void Configure(IApplicationBuilder app, IHostApplicationLifetime lifetime,
            ILogger<Startup> logger)
        {
            if (UpdateDbAndExit(logger))
            {
                lifetime.StopApplication();
                return;
            }

            app.UseRouting();
            app.UseDistributedSession();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGrpcService<LoginService>();
                endpoints.MapGrpcService<KeyValuesService>();
                endpoints.MapGrpcService<TagsService>();
                endpoints.MapGrpcService<FilesService>();
                endpoints.MapGrpcService<UsersService>();
                endpoints.MapGrpcService<KeywordsService>();
                endpoints.MapGrpcService<PublishService>();
                endpoints.MapControllers();
            });
        }
    }
}