import { Outlet } from "react-router-dom";
import Header from "./header";

const Layout = () => {
  return (
    <div className="min-h-[100vh] font-play md:bg-main bg-mobile bg-cover bg-center px-5 md:px-16 xl:px-32 flex flex-col">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;