import { StyleSheet } from 'react-native';

export const TITLE_SIZE = 24;
export const SUBTITLE_SIZE = 18;
export const TEXT_SIZE = 16;

export const sharedStyles = StyleSheet.create({
  title: {
    fontSize: TITLE_SIZE,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: TEXT_SIZE,
    fontFamily: 'TrajanProBold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    width: '80%',
    marginBottom: 0,
  },
  playersList: {
    marginTop: 16,
    width: '80%',
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});
