export function isModuleEnabled(modules: string[] | null, moduleName: string): boolean {
  if (!modules || !Array.isArray(modules) || modules.length === 0) return false;
  const upperModules = modules.map(m => String(m).toUpperCase());
  return moduleName.split(',').some(mod => upperModules.includes(mod.trim().toUpperCase()));
}
