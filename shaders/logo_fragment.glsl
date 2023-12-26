uniform sampler2D _MainTex;

    varying vec2 vertexUV;
    varying vec3 vertexNormal;
    
    void main() {
        float fresnelIntensity = 1.05 - dot(
            vertexNormal,
            vec3 (0.0,0.0,1.0)
         );
        vec3 fresnel = vec3 (.3, 0.0, .7) *
        pow (fresnelIntensity, 2.0);
        gl_FragColor = vec4(texture2D(_MainTex, 
        vertexUV).rgb + fresnel, 1.0);
    
    
        //gl_FragColor = vec4(0,1,0,1);
    }