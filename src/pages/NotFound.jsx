import { Link } from "react-router-dom";

const NotFound = () => {
        return (
        <main className="flex-1 flex items-center justify-center overflow-hidden py-12">
          <div className="flex flex-col items-center h-full justify-center gap-4">
            <h1 className="type-display-xs">404: Page Not Found</h1>
            <p className="type-prose-md text-center">You landed on a page that doesn't exist. <br></br>That's okay, we have plenty of movies to discover!</p>
            <Link to="/" className="px-6 h-12 flex flex-col align-center justify-center bg-primary text-white rounded-full hover:opacity-75">Discover Movies</Link>
          </div>
        </main>
    );
}

export default NotFound;