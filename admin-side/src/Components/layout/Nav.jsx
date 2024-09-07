import React from 'react'
import { Link } from 'react-router-dom';

const Nav = () => {
  return (
    <>
      <nav className="shadow-md px-16 py-4 flex justify-between items-center ">
        <div>
          <h1 className=" text-2xl font-bold text-white">SafetyIQ</h1>
        </div>
        <ul className="text-decoration-none flex gap-8 list">
          <li>
            <Link to={"/admin/dashboard"}>Dashboard</Link>
          </li>
          <li>
            <Link to={"/admin/academics"}>Academics</Link>
          </li>
          <li>
            <Link to={"/admin/reading"}>Read Courses</Link>
          </li>
          <li>
            <Link to={"/admin/resources"}>Resources</Link>
          </li>
          <li>
            <Link to="/admin/exams">Exam</Link>
          </li>
          <li>
            <Link to={"/admin/academics"}>Settings</Link>
          </li>
          <li>
            <Link to={"/admin/academics"}>Permission</Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Nav
