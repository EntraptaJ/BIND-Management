// UI/UI/Routes/Home/index.tsx
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import clsx from 'clsx';
import React from 'react';
import { useStyles } from 'UI/Routes/Home/Styles';
import { BaseCard } from 'UI/Components/Style/Cards/BaseCard';
import { BlogList } from 'UI/Components/BlogList';
import { Section } from 'UI/Components/Layout/Section';

interface Feature {
  label: string;
  body: string;
}

const Features: Feature[] = [
  { label: 'React', body: 'Entire frontend is written in React' },
  { label: 'Docker', body: 'Everything is done with docker and docker volumes.' }
];

export default function HomeRoute(): React.ReactElement {
  const classes = useStyles();

  return (
    <>
      <Section
        background='secondary'
        className={classes.topSection}
        title={{
          title: 'BIND Management',
          message: 'BIND Management is a BIND9 management platform for self hosted authoritative servers'
        }}
      />
      <section className={clsx(classes.sectionAlt, classes.mainSect)}>
        <div>
          <Typography variant='h5' gutterBottom className={clsx(classes.demoTitle)}>
            Demos
          </Typography>
        </div>
        <Grid container spacing={1} justify='center' alignItems='center' direction='row'>
          {Features.map(({ label, body }, i) => (
            <Grid item key={i}>
              <BaseCard title={label} body={body} className={classes.card} />
            </Grid>
          ))}
        </Grid>
      </section>
    </>
  );
}
