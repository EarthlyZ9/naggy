function Navbar() {
  return (
    <div className="flex flex-row h-[40px] w-full justify-between bg-gray-700 text-white items-center px-3">
      <p className="m-0">📣 Naggy</p>
      <button
        type="button"
        className="bg-transparent hover:bg-transparent p-0 border-none outline-none flex items-center hover:cursor-pointer"
        onClick={() => window.location.reload()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-4 transition-colors hover:stroke-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>
    </div>
  );
}

export default Navbar;
