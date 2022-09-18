import { Container, Text } from '@nextui-org/react';

export default function Header({ title , subtitle }) {
  return (
    <Container css={{ padding: '4rem 0', textAlign: 'center' }}>
      <Text
        h1
        css={{
          textGradient: '45deg, $blue600 20%, $pink600 60%'
        }}
        >
        { title }
      </Text>

      <Text size="1.5rem">
        { subtitle }
      </Text>
    </Container>
  )
}