import { LeadersProps, Player, PassComboObject, GraphConfig, AlignType } from './types'
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import SelectMatch from "./SelectMatch"
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import FormLabel from '@mui/material/FormLabel';
import { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';


const Leaders: React.FC<LeadersProps> = ({ matches }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentMatch, setCurrentMatch] = useState<string>("0");
  const [type, setType] = useState<string>("bestPassers");
  const [players, setPlayers] = useState<Player[]>([])
  const [passCombos, setPassCombos] = useState<PassComboObject[]>([])
  const handleMatchChange = (event: React.ChangeEvent<{ name?: string; value: string }>) => {
    setCurrentMatch(event.target.value);
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setType((event.target as HTMLInputElement).value);
  };

  useEffect(() => {
    setIsLoading(true)
    if (type === "mostCommonCombos") {
      fetch(`/api/most-common-combos/${currentMatch}`).then((res) => res.json()).then((data) => {
        setPassCombos(data.passCombos)
        setIsLoading(false)
      })
    }

    if (type === "bestPassers" || type === "bestReceivers") {
      fetch(`/api/leaders/${currentMatch}?type=${type}`).then((res) => res.json()).then((data) => {
        setPlayers(data.topPlayers)
        setIsLoading(false)
      })
    }
  }, [currentMatch, type])

  let graphConfig: GraphConfig = { headers: [], data: [] }
  if (type === "mostCommonCombos") {
    graphConfig = {
      headers: [
        { name: "player", label: "Passer" },
        { name: "recipient", label: "Recipient" },
        { name: "count", label: "Count" }
      ],
      data: passCombos
    }

  }
  if (type === "bestPassers" || type === "bestReceivers") {
    graphConfig = {
      headers: [
        { name: "name", label: "Player Name" },
        { name: "totalPasses", label: "Number of Passes" },
        { name: "averageValueAdded", label: "Average Value Added" }
      ],
      data: players
    }
  }
  return (
    <Grid container alignItems="center" direction="column">
      <Grid item xs={12} container justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <SelectMatch currentMatch={currentMatch} matches={matches} handleChange={handleMatchChange} />
        </Grid>
      </Grid>
      <Grid item xs={12} container justifyContent="center" sx={{ marginTop: (theme) => theme.spacing(2) }}>
        <Grid item xs={12} sm={8} lg={6}>
          <FormControl
            sx={{ display: "flex" }}
          >
            <RadioGroup
              row
              value={type}
              onChange={handleChange}
              sx={{ "& span": { color: "#000000" }, display: "flex", justifyContent: "space-around" }}
            >
              <FormControlLabel value="bestPassers" control={<Radio />} label="Best Passers" />
              <FormControlLabel value="bestReceivers" control={<Radio />} label="Best Receivers" />
              <FormControlLabel value="mostCommonCombos" control={<Radio />} label="Most Common Combos" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      {isLoading ?
        <Box sx={{ marginTop: (theme) => theme.spacing(4), "& svg": { color: "#000000" } }}>
          <CircularProgress />
        </Box>
        :
        <Grid item xs={12} container justifyContent="center" sx={{
          marginTop: (theme) => theme.spacing(2),
        }}>
          <Grid item xs={12} sm={8} lg={6}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {graphConfig.headers.map((header, index) => {
                      const align: AlignType = index === 0 ? "inherit" : "right"
                      if (header.name === "averageValueAdded") {
                        return (
                          <TableCell align="right">
                            <span style={{ marginRight: 10 }}>
                              Average Value Added
                            </span>
                            <Tooltip title={`Average value is calculated as the average obv_added for all passes ${type === "bestPassers" ? "made" : "received"} multiplied by 100.`}>
                              <IconButton sx={{ padding: 0 }}>
                                <InfoIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )
                      }
                      return <TableCell key={index} align={align}>{header.label}</TableCell>
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {graphConfig.data.map((dataObject, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      {graphConfig.headers.map((header, index) => {
                        const key = header.name
                        let value: any = dataObject[key as keyof typeof dataObject]
                        if (key === "averageValueAdded") {
                          value = formatValueAdded(value)
                        }
                        if (index === 0) {
                          return (
                            <TableCell component="th" scope="row">
                              {value}
                            </TableCell>
                          )
                        }
                        return <TableCell align="right">{value}</TableCell>
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>


      }
    </Grid>
  )
}

export default Leaders

function formatValueAdded(value: number | undefined): string {
  if (!value) return ""
  return (value * 100).toFixed(2)
}