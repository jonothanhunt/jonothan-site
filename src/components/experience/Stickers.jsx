import { Float, useTexture } from '@react-three/drei'

const Stickers = (props) =>
{
    const metaSpark = useTexture('/images/meta_spark.png')
    const reactLogo = useTexture('/images/react_logo.png')
    const R3FLogo = useTexture('/images/r3f_logo.png')

    const floatConfig = {
        rotationIntensity: 1, // XYZ rotation intensity, defaults to 1
        floatIntensity: 0.4
    }

    return (
        <group rotation={[Math.PI * - 0.25, 0, 0]} {...props}>
            <Float {...floatConfig}>
                <mesh position={[-10, 6, -1]} rotation={[0, 0, .4]}>
                    <planeGeometry args={[2.4, 2.4, 1, 1]} />
                    <meshBasicMaterial color={'#ffebfa'} map={metaSpark} alphaTest={0.5} transparent={false} />
                </mesh>
            </Float>

            <Float {...floatConfig}>
                <mesh position={[6, -3, -1]} rotation={[0, 0, .4]}>
                    <planeGeometry args={[2.4, 2.4, 1, 1]} />
                    <meshBasicMaterial color={'#ffebfa'} map={reactLogo} alphaTest={0.5} transparent={false} />
                </mesh>
            </Float>

            <Float {...floatConfig}>
                <mesh position={[10, -2, 0]} rotation={[0, 0, .7]}>
                    <planeGeometry args={[4, 4, 1, 1]} />
                    <meshBasicMaterial color={'#ffebfa'} map={R3FLogo} alphaTest={0.5} transparent={false} />
                </mesh>
            </Float>
        </group>
    )
}

export default Stickers