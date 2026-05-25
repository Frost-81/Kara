import { useEffect } from "react";

const SITE_URL = "https://karaimmobilierservice.com";

type PageMetadata = {
  title: string;
  description: string;
  path: string;
};

function upsertMetaDescription(content: string) {
  let descriptionTag = document.querySelector('meta[name="description"]');

  if (!descriptionTag) {
    descriptionTag = document.createElement("meta");
    descriptionTag.setAttribute("name", "description");
    document.head.appendChild(descriptionTag);
  }

  descriptionTag.setAttribute("content", content);
}

function upsertCanonicalLink(path: string) {
  let canonicalLink = document.querySelector('link[rel="canonical"]');

  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.setAttribute("rel", "canonical");
    document.head.appendChild(canonicalLink);
  }

  canonicalLink.setAttribute("href", `${SITE_URL}${path}`);
}

export function usePageMetadata({ title, description, path }: PageMetadata) {
  useEffect(() => {
    document.title = title;
    upsertMetaDescription(description);
    upsertCanonicalLink(path);
  }, [description, path, title]);
}