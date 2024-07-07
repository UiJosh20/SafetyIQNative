import React from 'react'

const Nav = () => {
  return (
    <>
      <nav className="shadow-md px-16 py-4 flex justify-between items-center ">
        <div>
          <h1 className=" text-2xl font-bold text-white">SafetyIQ</h1>
        </div>
        <ul className="text-decoration-none flex gap-8 list">
          <li>
            <a href="#">Academics</a>
          </li>
          <li>
            <a href="#">Exam</a>
          </li>
          <li>
            <a href="#">Settings</a>
          </li>
          <li>
            <a href="#">Permission</a>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Nav
