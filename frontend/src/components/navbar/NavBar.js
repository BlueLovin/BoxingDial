import { useState } from "react";
import {
  Navbar,
  Nav,
  NavItem,
  NavLink,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  NavbarText,
  DropdownToggle,
} from "reactstrap";
import ShowUser from "./ShowUser";
import {
  faHome,
  faPenFancy,
  faFistRaised,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  return (
    <Navbar color="light" light expand="md"  >
      <NavbarBrand href="/">BoxingDial</NavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="mr-auto m-auto" navbar>
          <NavItem>
            <NavLink href="/">
              <FontAwesomeIcon icon={faHome} />
              {" Home"}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="/posts/popular">
              <FontAwesomeIcon icon={faPenFancy} />
              {" Popular Posts"}
            </NavLink>
          </NavItem>
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret>
              <FontAwesomeIcon icon={faFistRaised} />
              {" Fights"}
            </DropdownToggle>
            <DropdownMenu left>
              <DropdownItem href="/fights/popular">Popular</DropdownItem>
              <DropdownItem href="/fights/recent">Recently Added</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Request a fight</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        <NavbarText>
          <ShowUser />
        </NavbarText>
      </Collapse>
    </Navbar>
  );
}
