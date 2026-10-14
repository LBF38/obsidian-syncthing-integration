{
  description = "Reproducible development environment for the Obsidian Syncthing Integration plugin";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      # Development shell: Node.js + pnpm, matching the Node version used in CI (Node 22).
      # Enter it with `nix develop`, or automatically via direnv (see .envrc).
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            # CI runs pnpm 9; nixpkgs only ships the latest supported majors.
            # pnpm 10 keeps the same lockfile format (lockfileVersion 9.0).
            pnpm_10
            git
            gnupg
          ];

          shellHook = ''
            echo "Obsidian Syncthing Integration - dev shell"
            echo "  node $(node --version) | pnpm $(pnpm --version)"
            echo "  Run 'pnpm install', then 'pnpm dev' (watch) or 'pnpm lint'."
          '';
        };
      });

      # Enables `nix fmt` (and formats the Nix files during `nix flake check`).
      formatter = forAllSystems (pkgs: pkgs.nixfmt-rfc-style);
    };
}
