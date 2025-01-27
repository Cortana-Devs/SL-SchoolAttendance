import { useState, useEffect, ChangeEvent } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Typography,
  SelectChangeEvent,
} from '@mui/material';

interface StudentSearchProps {
  onSearchChange: (filters: SearchFilters) => void;
}

interface SearchFilters {
  name: string;
  grade: string;
  indexNumber: string;
  class: string;
  section: string;
  stream?: string;
}

const StudentSearch = ({ onSearchChange }: StudentSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    grade: '',
    indexNumber: '',
    class: '',
    section: 'Primary',
    stream: '',
  });

  // Match the structure from AttendancePage.tsx
  const sections = ['Primary', 'Middle', 'Upper', 'Advanced'];
  
  const grades = {
    'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
    'Middle': ['Grade 6', 'Grade 7', 'Grade 8'],
    'Upper': ['Grade 9', 'Grade 10', 'Grade 11'],
    'Advanced': ['Grade 12', 'Grade 13']
  };

  const classes = {
    'Primary': ['A', 'B', 'C'],
    'Middle': ['A', 'B', 'C', 'D'],
    'Upper': ['A', 'B', 'C', 'D'],
    'Advanced': ['A', 'B', 'C']
  };

  const streams = ['Arts', 'Technology', 'Maths', 'Science', 'Bio'];

  const handleFilterChange = (
    field: keyof SearchFilters,
    value: string | SelectChangeEvent
  ) => {
    const newValue = typeof value === 'string' ? value : value.target.value;
    setFilters((prev) => {
      const updated = {
        ...prev,
        [field]: newValue,
      };

      // Reset dependent fields when section changes
      if (field === 'section') {
        updated.grade = '';
        updated.class = '';
        updated.stream = '';
      }

      // Reset class and stream when grade changes
      if (field === 'grade') {
        updated.class = '';
        if (!updated.grade.includes('12') && !updated.grade.includes('13')) {
          updated.stream = '';
        }
      }

      return updated;
    });
  };

  useEffect(() => {
    onSearchChange(filters);
  }, [filters, onSearchChange]);

  return (
    <Card sx={{ mb: 3, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Student Search
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Student Name"
              variant="outlined"
              value={filters.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Index Number"
              variant="outlined"
              value={filters.indexNumber}
              onChange={(e) => handleFilterChange('indexNumber', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Section</InputLabel>
              <Select
                value={filters.section}
                label="Section"
                onChange={(e) => handleFilterChange('section', e)}
              >
                {sections.map((section) => (
                  <MenuItem key={section} value={section}>
                    {section} Section
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Grade</InputLabel>
              <Select
                value={filters.grade}
                label="Grade"
                onChange={(e: SelectChangeEvent) => handleFilterChange('grade', e)}
              >
                <MenuItem value="">All Grades</MenuItem>
                {grades[filters.section as keyof typeof grades]?.map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {grade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {filters.section === 'Advanced' && filters.grade && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Stream</InputLabel>
                <Select
                  value={filters.stream}
                  label="Stream"
                  onChange={(e) => handleFilterChange('stream', e)}
                >
                  <MenuItem value="">All Streams</MenuItem>
                  {streams.map((stream) => (
                    <MenuItem key={stream} value={stream}>
                      {stream}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={filters.class}
                label="Class"
                onChange={(e) => handleFilterChange('class', e)}
                disabled={filters.section === 'Advanced' && !filters.stream}
              >
                <MenuItem value="">All Classes</MenuItem>
                {classes[filters.section as keyof typeof classes]?.map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    {filters.section === 'Advanced' && filters.stream
                      ? `${filters.stream}-${cls}`
                      : `Class ${cls}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StudentSearch; 