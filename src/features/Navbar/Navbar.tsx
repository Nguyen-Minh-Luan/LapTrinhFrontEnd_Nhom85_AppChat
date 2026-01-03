import "./Navbar.css";

export function Navbar() {
  return (
    <>
      <div className="navbar glass-eff border-radius dropshadow">
        <div className="flex flex-grow full-width">
          <div className="flex navbar-left">Home</div>
          <div className="flex navbar-right">Profile</div>
        </div>
        <div className="navbar-center">Nav</div>
      </div>
    </>
  );
}
