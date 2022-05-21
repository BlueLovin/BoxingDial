import React, { useState } from "react";
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
  faComments,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ShowInboxBell from "./ShowInboxBell";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

export const NavigationBar = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  return (
    <Navbar color="light" light expand="md">
      <NavbarBrand href="/">BoxingDial</NavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="mr-auto m-auto" navbar>
          <NavItem>
            <NavLink tag={Link} to="/">
              <FontAwesomeIcon icon={faHome} />
              {" Home"}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink tag={Link} to="/chat">
              <FontAwesomeIcon icon={faComments} />
              {" Chat"}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink tag={Link} to="/posts/popular">
              <FontAwesomeIcon icon={faPenFancy} />
              {" Popular Posts"}
            </NavLink>
          </NavItem>
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret>
              <FontAwesomeIcon icon={faFistRaised} />
              {" Fights"}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem tag={Link} to="/fights/popular">
                Popular
              </DropdownItem>
              <DropdownItem tag={Link} to="/fights/recent">
                Recently Added
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Request a fight</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        <ShowInboxBell />
        <NavbarText>
          <ShowUser />
        </NavbarText>
      </Collapse>
    </Navbar>
  );
});
export default NavigationBar;
