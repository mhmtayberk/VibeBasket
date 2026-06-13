import os from "node:os";import path from "node:path";import { BaseAdapter } from "./base-adapter";
export class GooseAdapter extends BaseAdapter {readonly id="goose" as const;readonly displayName="Goose";configPath():string{return path.join(os.homedir(),".config","goose","config.yaml")}postInstallHint():string{return "Restart Goose or reload the session for MCP changes to take effect."}}
