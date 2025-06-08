"use client";

import { Badge } from "@/components/ui/badge";

interface ApiListProps {
  entityName: string;
  entityIdName: string;
}

export function ApiList({
  entityName,
  entityIdName,
}: ApiListProps) {
  return (
    <div className="rounded-md bg-slate-100 p-4">
      <div className="flex flex-col gap-4">
        <ApiItem
          method="GET"
          path={`/api/${entityName}`}
          description="List all items"
        />
        <ApiItem
          method="GET"
          path={`/api/${entityName}/{${entityIdName}}`}
          description="Get a single item"
        />
        <ApiItem
          method="POST"
          path={`/api/${entityName}`}
          description="Create a new item"
        />
        <ApiItem
          method="PATCH"
          path={`/api/${entityName}/{${entityIdName}}`}
          description="Update an item"
        />
        <ApiItem
          method="DELETE"
          path={`/api/${entityName}/{${entityIdName}}`}
          description="Delete an item"
        />
      </div>
    </div>
  );
}

interface ApiItemProps {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
}

const ApiItem = ({
  method,
  path,
  description
}: ApiItemProps) => {
  const methodColors = {
    GET: "bg-blue-100 text-blue-700",
    POST: "bg-green-100 text-green-700",
    PATCH: "bg-yellow-100 text-yellow-700",
    DELETE: "bg-red-100 text-red-700"
  };

  return (
    <div className="flex items-start gap-x-4">
      <Badge variant="outline" className={`${methodColors[method]} px-2 py-1 font-mono text-xs`}>
        {method}
      </Badge>
      <div className="space-y-1">
        <code className="font-mono text-sm">{path}</code>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}; 