import cv2
import numpy as np
import os

# Caminhos dos arquivos
input_dir = r"C:\Users\GABS\Documents\My KAIROS\scratch\cartao-dhecor"
files = ["Cartão-dechor-frente.png", "Cartão-dhecor-verso.png"]

for filename in files:
    filepath = os.path.join(input_dir, filename)
    if not os.path.exists(filepath):
        print(f"Arquivo não encontrado: {filepath}")
        continue
        
    print(f"Processando: {filename}")
    
    # 1. Carregar a imagem
    img = cv2.imread(filepath)
    if img is None:
        print("Erro ao ler a imagem.")
        continue
        
    # 2. Converter para Tons de Cinza
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Como o fundo é azul escuro (capitonê) e o texto/logo é claro (dourado/branco),
    # Na imagem em tons de cinza: fundo = escuro (valores baixos), logo = claro (valores altos).
    
    # Queremos que o logo fique PRETO (0) e o fundo BRANCO (255).
    # Portanto, precisamos aplicar um Threshold Invertido (THRESH_BINARY_INV).
    
    # Método 1: Threshold Fixo Simples (Corte no brilho)
    # Valores acima de 120 viram 0 (Preto), valores abaixo de 120 viram 255 (Branco)
    _, mask_simple = cv2.threshold(gray, 120, 255, cv2.THRESH_BINARY_INV)
    
    # Método 2: Threshold Adaptativo de Otsu (O algoritmo acha o melhor ponto de corte sozinho)
    _, mask_otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Salvar as duas versões para o usuário escolher a que ficou com as bordas melhores
    name_only = filename.replace(".png", "")
    
    out_simple = os.path.join(input_dir, f"{name_only}_mascara_v1_simples.png")
    out_otsu = os.path.join(input_dir, f"{name_only}_mascara_v2_otsu.png")
    
    cv2.imwrite(out_simple, mask_simple)
    cv2.imwrite(out_otsu, mask_otsu)
    
    print(f"-> Geradas máscaras para {name_only}")

print("Processamento concluído!")
