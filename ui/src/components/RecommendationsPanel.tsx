import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Recommendation {
  id: string;
  url: string;
  title?: string;
}

export function RecommendationsPanel({
  recommendations = [],
}: {
  recommendations?: Recommendation[];
}) {
  console.log("Recommendations:", recommendations);
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recommended for you</CardTitle>
      </CardHeader>
      <CardContent>
        {Array.isArray(recommendations) && recommendations.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(recommendations || []).map((item) => (
              <li key={item.id} className="p-3 border rounded-md">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:text-accent truncate block"
                >
                  {item.title || item.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No recommendations yet. Keep rating content!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
