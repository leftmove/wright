"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Star, 
  Archive, 
  Calendar,
  Tag,
  X
} from "lucide-react";
import { useState } from "react";

interface DocumentFiltersProps {
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: {
    category?: string;
    tags?: string[];
    starred?: boolean;
    archived?: boolean;
  }) => void;
  availableCategories: string[];
  availableTags: string[];
}

export function DocumentFilters({ 
  onSearchChange, 
  onFilterChange, 
  availableCategories, 
  availableTags 
}: DocumentFiltersProps) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    category?: string;
    tags: string[];
    starred: boolean;
    archived: boolean;
  }>({
    tags: [],
    starred: false,
    archived: false,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const toggleFilter = (type: string, value?: string) => {
    let newFilters = { ...activeFilters };

    switch (type) {
      case "starred":
        newFilters.starred = !newFilters.starred;
        break;
      case "archived":
        newFilters.archived = !newFilters.archived;
        break;
      case "category":
        newFilters.category = newFilters.category === value ? undefined : value;
        break;
      case "tag":
        if (value) {
          if (newFilters.tags.includes(value)) {
            newFilters.tags = newFilters.tags.filter(tag => tag !== value);
          } else {
            newFilters.tags = [...newFilters.tags, value];
          }
        }
        break;
    }

    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      tags: [],
      starred: false,
      archived: false,
    };
    setActiveFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = activeFilters.starred || 
                          activeFilters.archived || 
                          activeFilters.category || 
                          activeFilters.tags.length > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilters.starred ? "default" : "outline"}
          size="sm"
          onClick={() => toggleFilter("starred")}
          className="h-8"
        >
          <Star className="w-4 h-4 mr-1" />
          Starred
        </Button>

        <Button
          variant={activeFilters.archived ? "default" : "outline"}
          size="sm"
          onClick={() => toggleFilter("archived")}
          className="h-8"
        >
          <Archive className="w-4 h-4 mr-1" />
          Archived
        </Button>

        {/* Category Filters */}
        {availableCategories.map((category) => (
          <Button
            key={category}
            variant={activeFilters.category === category ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("category", category)}
            className="h-8"
          >
            <Tag className="w-4 h-4 mr-1" />
            {category}
          </Button>
        ))}

        {/* Tag Filters */}
        {availableTags.slice(0, 5).map((tag) => (
          <Button
            key={tag}
            variant={activeFilters.tags.includes(tag) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("tag", tag)}
            className="h-8"
          >
            #{tag}
          </Button>
        ))}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-muted-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.starred && (
            <Badge variant="secondary" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Starred
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => toggleFilter("starred")}
              />
            </Badge>
          )}
          {activeFilters.archived && (
            <Badge variant="secondary" className="text-xs">
              <Archive className="w-3 h-3 mr-1" />
              Archived
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => toggleFilter("archived")}
              />
            </Badge>
          )}
          {activeFilters.category && (
            <Badge variant="secondary" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {activeFilters.category}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => toggleFilter("category", activeFilters.category)}
              />
            </Badge>
          )}
          {activeFilters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => toggleFilter("tag", tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}