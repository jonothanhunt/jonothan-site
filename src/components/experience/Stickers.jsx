import { Float, useTexture, useCursor } from '@react-three/drei'
import { useState } from 'react'

const Stickers = (props) =>
{
    const metaSpark = useTexture('/images/meta_spark.png')
    const reactLogo = useTexture('/images/react_logo.png')
    const R3FLogo = useTexture('/images/r3f_logo.png')
    const EffectHouseLogo = useTexture('/images/effect_house.png')

    const [hovered, setHovered] = useState()
    useCursor(hovered, /*'pointer', 'auto'*/)

    const floatConfig = {
        rotationIntensity: 1, // XYZ rotation intensity, defaults to 1
        floatIntensity: 0.4
    }

    return (
        <group rotation={[Math.PI * - 0.25, 0, 0]} {...props}>
            <Float {...floatConfig}>
                <mesh position={[-10, 6, -1]} rotation={[0, 0, .4]} onClick={() => window.open("https://www.credly.com/badges/c9b7924f-60ad-461c-9614-39e0efc8530b/public_url", "_blank")} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
                    <planeGeometry args={[3, 3, 1, 1]} />
                    <meshBasicMaterial color={'#ffebfa'} map={metaSpark} alphaTest={0.5} transparent={false} />
                </mesh>
            </Float>

            <Float {...floatConfig}>
                <mesh position={[6, -3, -1]} rotation={[0, 0, .4]}>
                    <planeGeometry args={[3, 3, 1, 1]} />
                    <meshBasicMaterial color={'#ffebfa'} map={reactLogo} alphaTest={0.5} transparent={false} />
                </mesh>
            </Float>

            <Float {...floatConfig}>
                <mesh position={[10, -2, 0]} rotation={[0, 0, .7]}>
                    <planeGeometry args={[5, 5, 1, 1]} />
                    <meshBasicMaterial color={'#ffebfa'} map={R3FLogo} alphaTest={0.5} transparent={false} />
                </mesh>
            </Float>

            <Float {...floatConfig}>
                <mesh position={[-3, 4, 0]} rotation={[0, 0, .7]}>
                    <planeGeometry args={[3, 3, 1, 1]} />
                    <meshBasicMaterial color={'#ffebfa'} map={EffectHouseLogo} alphaTest={0.5} transparent={false} />
                </mesh>
            </Float>
        </group>
    )
}

export default Stickers