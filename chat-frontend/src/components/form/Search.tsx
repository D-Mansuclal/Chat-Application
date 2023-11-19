import { useState } from 'react';
import LogoIcon from '../logo/LogoIcon';
import './Search.css'

/**
 * Props for the Search component
 * @param width - The width of the window
 */
interface SearchProps {
    width: number;
}

/**
 * Search input component used to search for posts and users
 * @param searchProps - The props for the Search component
 * @returns Seach Component
 */
const Search: React.FC<SearchProps> = (searchProps) => {

    const { width } = searchProps;

    const [search, setSearch] = useState<string>("");

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        if (event.target.value) {
            document.getElementById("clear")!.classList.remove("search__clear--hidden");
            document.getElementById("clear")!.classList.add("search__clear--active");

        }
        else {
            document.getElementById("clear")!.classList.remove("search__clear--active");
            document.getElementById("clear")!.classList.add("search__clear--hidden");
        };
    };

    /** Clears the search bar */
    const clearSearch = () => {
        setSearch("");
        document.getElementById("clear")!.classList.remove("search__clear--active");
        document.getElementById("clear")!.classList.add("search__clear--hidden");
    };

    return (
        <div className="search">
            {width > 860 ? <i className="bi bi-search search__icon"></i> : <LogoIcon />}
            <input className="search__input"
                type="text"
                placeholder="Search"
                onChange={handleSearchChange}
                value={search}
            />
            <i id="clear" onClick={clearSearch}
                className="bi bi-x search__clear search__clear--hidden"
                tabIndex={0}
            ></i>
        </div>
    )
}

export default Search;