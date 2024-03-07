export interface SearchInputProps {
    /**
     * Class names.
     */
    className?: string;
    /**
     * Message to display in the search field
     */
    message?: string;

    /**
     * Display in compact mode.
     */
    compact: boolean;

    /**
     * The query to search for.
     */
    onSearch: (query: string) => void;
}
