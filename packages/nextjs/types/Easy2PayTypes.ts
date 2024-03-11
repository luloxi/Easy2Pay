export type FilterProps = {
  label: string;
  selected: boolean;
};

export type SearchBarProps = {
  searchFilters: FilterProps[];
  updateSearchFilters: (index: number) => void;
  searchInput: string;
  updateSearchInput: (index: string) => void;
};
