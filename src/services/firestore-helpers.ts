import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Tournament,
  Group,
  Team,
  Match,
  MatchBet,
  GroupBet,
  KnockoutBet,
  GroupStandings,
  User,
  Predictor,
  PredictorStats,
  Notification,
} from '../types/firestore';

export const collections = {
  users: () => collection(db, 'users') as CollectionReference<User>,
  tournaments: () => collection(db, 'tournaments') as CollectionReference<Tournament>,
};

export const tournamentSubcollections = {
  groups: (tournamentId: string) =>
    collection(db, 'tournaments', tournamentId, 'groups') as CollectionReference<Group>,
  teams: (tournamentId: string) =>
    collection(db, 'tournaments', tournamentId, 'teams') as CollectionReference<Team>,
  matches: (tournamentId: string) =>
    collection(db, 'tournaments', tournamentId, 'matches') as CollectionReference<Match>,
  bets: (tournamentId: string) =>
    collection(db, 'tournaments', tournamentId, 'bets') as CollectionReference<MatchBet>,
  groupBets: (tournamentId: string) =>
    collection(db, 'tournaments', tournamentId, 'group_bets') as CollectionReference<GroupBet>,
  knockoutBets: (tournamentId: string) =>
    collection(
      db,
      'tournaments',
      tournamentId,
      'knockout_bets',
    ) as CollectionReference<KnockoutBet>,
  groupStandings: (tournamentId: string) =>
    collection(
      db,
      'tournaments',
      tournamentId,
      'group_standings',
    ) as CollectionReference<GroupStandings>,
};

export const userSubcollections = {
  predictors: (userId: string) =>
    collection(db, 'users', userId, 'predictors') as CollectionReference<Predictor>,
  notifications: (userId: string) =>
    collection(db, 'users', userId, 'notifications') as CollectionReference<Notification>,
};

export const predictorSubcollections = {
  stats: (userId: string, predictorId: string) =>
    collection(
      db,
      'users',
      userId,
      'predictors',
      predictorId,
      'stats',
    ) as CollectionReference<PredictorStats>,
};

export const refs = {
  user: (userId: string) => doc(db, 'users', userId) as DocumentReference<User>,
  predictor: (userId: string, predictorId: string) =>
    doc(db, 'users', userId, 'predictors', predictorId) as DocumentReference<Predictor>,
  tournament: (tournamentId: string) =>
    doc(db, 'tournaments', tournamentId) as DocumentReference<Tournament>,
  group: (tournamentId: string, groupId: string) =>
    doc(db, 'tournaments', tournamentId, 'groups', groupId) as DocumentReference<Group>,
  team: (tournamentId: string, teamId: string) =>
    doc(db, 'tournaments', tournamentId, 'teams', teamId) as DocumentReference<Team>,
  match: (tournamentId: string, matchId: string) =>
    doc(db, 'tournaments', tournamentId, 'matches', matchId) as DocumentReference<Match>,
};
