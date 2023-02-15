import { matchPath } from 'react-router-dom'

import { useAppSelector } from '../../hooks/useAppSelector'

import type { ReactElement } from 'react-markdown'

// SideWindowRouter doesn't have a switch behavior (i.e. renders all routes that matches)
// be careful to write routes that never collides
// (i.e. 'missions/new' would collide with 'missions/:id' -> rewritten to 'missions_new' or '/missions/new/' used with strict + exact)

// Unlike original Route component, exact and strict are default to true,
// so it's easier to use non-colliding routes

export type RouteProps = {
  children: ReactElement
  exact?: boolean
  path: string | string[]
  strict?: boolean
}
export function Route({ children, exact = true, path, strict = true }: RouteProps) {
  const { currentPath } = useAppSelector(state => state.sideWindow)

  const routeParams = matchPath(currentPath, {
    exact,
    path,
    strict
  })

  return routeParams ? children : null
}