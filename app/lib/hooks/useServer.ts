import { useState, useEffect } from "react";

interface UseServerProps {
  url: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.text());

export function useServer({ url }: UseServerProps): { data: string } {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log(url)

  useEffect(() => {
    setIsLoading(true);
    fetcher(url)
      .then((data) => setData(data))
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  }, [url]);

  if (error) {
    throw error;
  }

  if (isLoading) return { data: "Loading..." };

  const body = data.match(/<body>(.*?)<\/body>/s)?.[1];
  console.log(body);

  return { data: body };
}