export function isModuleEnabled(modules: string[] | null, moduleName: string): boolean {
  if (!modules || !Array.isArray(modules) || modules.length === 0) return true;
  return modules.map(m => String(m).toUpperCase()).includes(moduleName.toUpperCase());
}
