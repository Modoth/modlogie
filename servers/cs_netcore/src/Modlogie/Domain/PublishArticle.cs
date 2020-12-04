using System;

namespace Modlogie.Domain
{
    public class PublishArticle
    {
        public string BaseUrl { get; set; }

        public string Url { get; set; }

        public string Title { get; set; }

        public PublishArticleSlice[] Slices { get; set; }

        public string Group { get; set; }

        public Guid Id { get; set; }
    }
}