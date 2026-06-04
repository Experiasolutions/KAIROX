from PIL import Image
import os

input_dir = r"C:\Users\GABS\Documents\My KAIROS\scratch\cartao-dhecor"
files = ["Cartão-dechor-frente.png", "Cartão-dhecor-verso.png"]

for filename in files:
    filepath = os.path.join(input_dir, filename)
    if not os.path.exists(filepath):
        continue
        
    print(f"Processando: {filename}")
    
    # Abrir imagem e converter para escala de cinza (L)
    img = Image.open(filepath).convert('L')
    
    # Threshold simples: como o fundo é escuro e o texto é claro,
    # vamos transformar os pixels escuros em BRANCO (255) e os claros em PRETO (0)
    # Valor de corte (threshold) - ajuste se necessário (ex: 128)
    threshold = 120
    
    # apply point operation
    mask = img.point(lambda p: 0 if p > threshold else 255)
    
    out_name = filename.replace(".png", "_mascara.png")
    out_path = os.path.join(input_dir, out_name)
    
    mask.save(out_path)
    print(f"Máscara salva em: {out_path}")

print("Fim!")
