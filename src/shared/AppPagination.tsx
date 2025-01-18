import React, { useState } from 'react'
import {PaginationComponentProps} from '../helpers/interface/interfaces'
import { RxCaretLeft, RxCaretRight } from 'react-icons/rx';
import "../styles/AppCustomCss.css"

const AppPagination:React.FC<PaginationComponentProps> = ({ currentData, itemsPerPage, onPageChange }) => {
    const [currentPage, setCurrentPage] = useState(1);


  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(currentData.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const pageWindow = 1;
  const firstPage = Math.max(1, currentPage - pageWindow);
  const lastPage = Math.min(firstPage + pageWindow * 2, pageNumbers.length);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    onPageChange(pageNumber);
  };

  return (
    <div className="text-center">
      <nav className="pt-4">
        <ul className="py-1 pagination">
          <li
            className={`nav-arrows page-link cursor-pointer ${
              currentPage === 1 ? 'disabled' : ''
            }`}
            onClick={() => paginate(Math.max(1, currentPage - 1))}
          >
            <RxCaretLeft className="text-[24px] cursor-pointer" />
          </li>
          {pageNumbers.slice(firstPage - 1, lastPage).map((number) => (
            <li
              key={number}
              className={`page-item ${currentPage === number ? 'active' : ''}`}
            >
              <button onClick={() => paginate(number)} className="page-link">
                {number}
              </button>
            </li>
          ))}
          <li
            className={`nav-arrows page-link cursor-pointer ${
              currentPage === pageNumbers.length ? 'disabled' : ''
            }`}
            onClick={() => paginate(Math.min(pageNumbers.length, currentPage + 1))}
          >
            <RxCaretRight className="text-[24px] cursor-pointer" />
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default AppPagination