import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';

// Mostra o texto dos artigos. Formato aceito: "## " subtitulo, "- " item de lista, **negrito**.
// Paragrafos separados por linha em branco.

function Inline({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <Text key={i} style={styles.negrito}>
            {p.slice(2, -2)}
          </Text>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        )
      )}
    </>
  );
}

export function TextoArtigo({ texto }: { texto: string }) {
  const blocos = texto.trim().split(/\n\s*\n/);
  return (
    <View style={styles.corpo}>
      {blocos.map((bloco, i) => {
        const b = bloco.trim();
        if (b.startsWith('## ')) {
          return (
            <Text key={i} style={styles.subtitulo}>
              {b.slice(3)}
            </Text>
          );
        }
        const linhas = b.split('\n');
        if (linhas.every((l) => l.trim().startsWith('- '))) {
          return (
            <View key={i} style={styles.lista}>
              {linhas.map((l, j) => (
                <View key={j} style={styles.item}>
                  <View style={styles.marcador} />
                  <Text style={styles.paragrafo}>
                    <Inline texto={l.trim().slice(2)} />
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text key={i} style={styles.paragrafo}>
            <Inline texto={linhas.join(' ')} />
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  corpo: { gap: 14 },
  subtitulo: { fontSize: 19, fontWeight: '900', color: Colors.text, marginTop: 10 },
  paragrafo: { flex: 1, fontSize: 16, lineHeight: 25, color: Colors.text },
  negrito: { fontWeight: '800' },
  lista: { gap: 10 },
  item: { flexDirection: 'row', gap: 12 },
  marcador: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary.DEFAULT, marginTop: 10 },
});
