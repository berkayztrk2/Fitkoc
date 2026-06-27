import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Body from 'react-native-body-highlighter';

const MAP_TO_RBH = {
  f_chest_l: 'chest', f_chest_r: 'chest',
  f_delt_l: 'front-deltoids', f_delt_r: 'front-deltoids',
  b_delt_l: 'back-deltoids', b_delt_r: 'back-deltoids',
  f_bicep_l: 'biceps', f_bicep_r: 'biceps',
  f_tri_l: 'triceps', f_tri_r: 'triceps', b_tri_l: 'triceps', b_tri_r: 'triceps',
  f_fgarm_l: 'forearm', f_fgarm_r: 'forearm', b_fgarm_l: 'forearm', b_fgarm_r: 'forearm',
  f_core: 'abs', f_oblq_l: 'obliques', f_oblq_r: 'obliques',
  f_quad_l: 'quadriceps', f_quad_r: 'quadriceps',
  b_ham_l: 'hamstring', b_ham_r: 'hamstring',
  b_glute: 'gluteal',
  b_calf_l: 'calves', b_calf_r: 'calves',
  b_lat_l: 'upper-back', b_lat_r: 'upper-back', b_trap: 'trapezius',
  b_mid_bk: 'lower-back', b_lo_bk: 'lower-back', b_erect: 'lower-back',
  f_addc: 'adductor'
};

const LEVEL_COLORS = {
  1: '#F0F0F3',
  2: '#FFD166',
  3: '#FF9F1C',
  4: '#FF6B35',
  5: '#E63946'
};

export default function HeroMuscleMap({ muscleXP = {}, gender = 'male' }) {
  
  const aggregatedData = {};
  Object.entries(muscleXP).forEach(([key, xp]) => {
     const rbhKey = MAP_TO_RBH[key];
     if (rbhKey) {
        aggregatedData[rbhKey] = (aggregatedData[rbhKey] || 0) + xp;
     }
  });

  const bodyData = Object.entries(aggregatedData).map(([muscle, xp]) => {
     let lvl = 1;
     if (xp > 50) lvl = 2;
     if (xp > 200) lvl = 3;
     if (xp > 500) lvl = 4;
     if (xp > 1000) lvl = 5;

     return {
       slug: muscle,
       intensity: lvl,
       color: LEVEL_COLORS[lvl]
     };
  });

  return (
    <View style={styles.container}>
      <View style={styles.figureBox}>
        <Body 
          data={bodyData}
          gender={gender}
          side="front"
          scale={0.9}
          frontOnly={false}
          colors={[ '#F0F0F3', '#FFD166', '#FF9F1C', '#FF6B35', '#E63946' ]}
        />
      </View>
      <View style={styles.figureBox}>
        <Body 
          data={bodyData}
          gender={gender}
          side="back"
          scale={0.9}
          frontOnly={false}
          colors={[ '#F0F0F3', '#FFD166', '#FF9F1C', '#FF6B35', '#E63946' ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16
  },
  figureBox: {
    width: 140,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
