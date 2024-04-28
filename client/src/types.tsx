export type Player = {
  id: string,
  x: number,
  y: number,
  r: number,
  name: string,
  count: number
}

export type PassingVisualizationProps = {
  matches: Match[]
}

export type PlayerSelectionsProps = {
  arrayOfPlayers: Player[],
  state: PassingVisualizationState

}
export type SelectMatchProps = {
  matches: Match[],
  currentMatch: string
}
export type PassingVisualizationState = {
  isLoading: boolean,
  arrayOfPlayers: Player[],
  filteredPlayers: Player[],
  passMap: any,
  activePasser: string,
  activeReceiver: string
}

export type Match = {
  away_team_id: number,
  away_team_name: string,
  home_team_id: number,
  home_team_name: string,
  human_readable_date: string,
  id: string,
  match_date: string,
}


export type LayoutProps = {
  children: React.ReactNode
}