FROM microsoft/dotnet:2.2-aspnetcore-runtime-stretch-slim
WORKDIR /app
COPY app .
EXPOSE 80
EXPOSE 443
ENTRYPOINT ["dotnet", "ModothStudy.Web.dll"]