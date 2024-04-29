export type Player = {
  id: string,
  x: number,
  y: number,
  r: number,
  name: string,
  totalPasses: number,
  averageValueAdded?: number
}
export type AlignType = 'left' | 'center' | 'right' | 'justify' | 'inherit';
export type PassComboObject = {
  count: number,
  player: string,
  recipient: string,
}
type GraphHeader = {
  name: string,
  label: string
}

export type GraphConfig = {
  headers: GraphHeader[],
  data: PassComboObject[] | Player[]
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
  currentMatch: string,
  handleChange: (event: React.ChangeEvent<{ name?: string; value: string }>) => void
}

export type LeadersProps = {
  matches: Match[],
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