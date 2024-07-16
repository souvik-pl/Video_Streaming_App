import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ROUTES } from "@/common/common";

function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function selectPageHandler(value: string) {
    navigate(value);
  }

  return (
    <nav className="w-full h-full flex justify-between items-center">
      <Link to={"/"} className="text-primary text-3xl">
        VidFlix
      </Link>
      <Select onValueChange={selectPageHandler} value={pathname}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={ROUTES.home}>Home</SelectItem>
            <SelectItem value={ROUTES.studio}>Studio</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </nav>
  );
}

export default Navbar;
