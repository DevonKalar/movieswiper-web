import RangeSlider from "@components/common/RangeSlider.jsx";
import PopOver from "@components/common/PopOver.jsx";

const WatchListFilter = ({ filters, addFilter, removeFilter, availableGenres, availableDecades }) => {
	
	const renderFilterContent = (category) => {
		const filterRenderers = {
			rating: () => (
				<RangeSlider
					min={1}
					max={10}
					step={1}
					value={filters.rating}
          label="Ratings"
					onChange={(newRange) => addFilter('rating', newRange)}
				/>
			),
			genre: () => availableGenres.map((genre) => (
				<button 
					key={genre} 
					onClick={() => addFilter('genre', genre)}
					className={`flex h-8 p-2 px-4 text-sm outline border-1 ${
						filters.genre.includes(genre) ? 'bg-primary' : ''
					}`}
				>
					{genre}
				</button>
			)),
			decade: () => availableDecades.map((decade) => (
				<button 
					key={decade} 
					onClick={() => addFilter('decade', decade)}
					className={`flex h-8 p-2 px-4 text-sm outline border-1 ${
						filters.decade.includes(decade) ? 'bg-primary' : ''
					}`}
				>
					{decade}s
				</button>
			))
		};

		return filterRenderers[category]?.() || <p>No options available</p>;
	};

	return (
		<>
			<div className="grid md:grid-cols-4 gap-4 my-4 mt-8">
				<form role="search" aria-label="Filter movies by title">
					<label htmlFor="filter-title" className="sr-only">Filter By Title</label>
					<input
						id="filter-title"
						type="text"
						placeholder="Filter By Title"
						className="border-2 p-2 px-4 transparent w-full"
						value={filters.searchTerm}
						onChange={e => addFilter('searchTerm', e.target.value)}
					/>
				</form>

				{Object.keys(filters).map((category) => {
					if (category === 'searchTerm') return null;
					
					return (
						<PopOver
							key={category}
							label={category.charAt(0).toUpperCase() + category.slice(1)}
						>
							{renderFilterContent(category)}
						</PopOver>
					);
				})}
			</div>

			{Object.values(filters).length > 0 && (
				<div className="flex flex-row align-center gap-2 py-2" aria-label="Active filters">
          {Object.entries(filters).map(([filterCategory, filterValue]) => {
            // Skip searchTerm and empty arrays
            if (filterCategory === 'searchTerm') return null;
            
            // Handle rating filter (object)
            if (filterCategory === 'rating') {
              if (filterValue.min === 1 && filterValue.max === 10) return null;
              return (
                <div
                  key={`${filterCategory}-${filterValue.min}-${filterValue.max}`}
                  className="flex flex-row items-center text-sm gap-1 outline border-1 px-4 rounded-4xl"
                >
                  <span>
                    {filterValue.min} - {filterValue.max} ({filterCategory})
                  </span>
                  <button
                    className="bg-transparent px-2 h-8"
                    onClick={() => removeFilter(filterCategory, filterValue)}
                    type="button"
                    aria-label={`Remove ${filterCategory} filter`}
                  >
                    x
                  </button>
                </div>
              );
            }
            
            // Handle array filters (genre, decade)
            if (Array.isArray(filterValue) && filterValue.length > 0) {
              return filterValue.map((value) => (
                <div
                  key={`${filterCategory}-${value}`}
                  className="flex flex-row items-center text-sm gap-1 outline border-1 px-4 rounded-4xl"
                >
                  <span>
                    {value}{filterCategory === 'decade' ? 's' : ''} ({filterCategory})
                  </span>
                  <button
                    className="bg-transparent px-2 h-8"
                    onClick={() => removeFilter(filterCategory, value)}
                    type="button"
                    aria-label={`Remove filter: ${value} in ${filterCategory}`}
                  >
                    x
                  </button>
                </div>
              ));
            }
            
            return null;
          })}
				</div>
			)}
		</>
	);
};

export default WatchListFilter;