import type { ReportingDetailed } from '../../../entities/reporting'

export function subThemesFilterFunction(reporting: ReportingDetailed, subThemesFilter: string[] | undefined) {
  if (!subThemesFilter || subThemesFilter.length === 0) {
    return true
  }

  return !!reporting?.subThemes?.find(subTheme => {
    if (subThemesFilter.find(subThemeFilter => subThemeFilter === subTheme)) {
      return subTheme
    }

    return false
  })
}
