export function isModuleEnabled(modules: string[] | null, moduleName: string): boolean {
  if (!modules || !Array.isArray(modules)) return false;
  return modules.map(m => m.toUpperCase()).includes(moduleName.toUpperCase());
}
