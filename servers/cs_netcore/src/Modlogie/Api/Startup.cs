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

        public IConfiguration Configuration { get; }

        private bool IsDevelopment { get; set; }

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
            services.AddGrpc();
            services.AddDistributedSession(options =>
            {
                options.CookieName = Configuration.GetValue<string>("Session:Cookie:Name");
                options.IdleTimeout = TimeSpan.FromSeconds(Configuration.GetValue<int>("Session:IdleTimeout"));
            });
            services.Configure<LocalFileContentServiceOptions>(Configuration.GetSection("File"));
        }

        public void ConfigureContainer(ContainerBuilder builder)
        {
            builder.RegisterModule(new AutofacModule());
            if (IsDevelopment)
            {
                builder.RegisterModule(new AutofacDevelopmentModule());
            }
            else
            {
                builder.RegisterModule(new AutofacProductionModule());
            }
        }

        private bool UpdateDbAndExit(ILogger logger)
        {
            var scriptsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "sqls");
            var dbUpdater = new DbUpdater(logger,
            Configuration.GetMySqlConnectionString(),
            Configuration.GetValue<string>("ConnectionProps:Database"),
            Configuration.GetMySqlConnectionString(true),
            scriptsPath);
            var updateTask = dbUpdater.UpdateAsync();
            updateTask.Wait();
            return Configuration.GetValue<bool>("Execue:UpdateDbOnly");
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IHostApplicationLifetime lifetime, ILogger<Startup> logger)
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
                endpoints.MapGrpcService<Services.LoginService>();
                endpoints.MapGrpcService<Services.KeyValuesService>();
                endpoints.MapGrpcService<Services.TagsService>();
                endpoints.MapGrpcService<Services.FilesService>();
                endpoints.MapGrpcService<Services.UsersService>();

                endpoints.MapGet("/", async context =>
                {
                    await context.Response.WriteAsync("Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909");
                });
            });
        }
    }
}
