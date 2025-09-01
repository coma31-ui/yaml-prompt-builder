'use client'
import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const dict = {
  mode: { 人物: 'portrait', 風景: 'landscape', '人物+風景': 'portrait+landscape' },
  gender: { 指定なし: undefined, 男性: 'male', 女性: 'female' },
  age: {
    指定なし: undefined, 乳児: 'infant', 幼児: 'toddler', '10代': 'teens', '20代': '20s', '30代': '30s', '40代':'40s', '50代':'50s', '60代':'60s', '70代':'70s',
  },
  style: { シネマティック: 'cinematic', ドキュメンタリー: 'documentary', ファインアート: 'fine art', 商業広告: 'commercial' },
  composition: { 三分割法: 'rule of thirds', 対角線構図: 'diagonal composition', 中央配置: 'subject centered', 俯瞰: 'top-down', ローアングル: 'low angle' },
  perspective: { 目線の高さ: 'eye-level angle', やや俯瞰: 'slightly top-down', ローアングル: 'low angle' },
  depth: { 浅い被写界深度: 'shallow depth of field', 深い被写界深度: 'deep depth of field' },
  focus: { 全体にピント: 'overall sharp focus', 前景を強調: 'foreground emphasis, background slightly soft', 主題を強調: 'sharp focus on subject, creamy bokeh background' },
  lightingType: { 日中の自然光: 'daylight photography', ゴールデンアワー: 'golden hour sunlight', 曇天の柔らかい光: 'overcast soft light', スタジオ: 'studio lighting' },
  lightDir: { 正面光: 'front lighting', 逆光: 'backlit', 横からの光: 'side lighting', トップライト: 'top light' },
  lens: { '24mm':'24mm', '28mm':'28mm', '35mm':'35mm', '50mm':'50mm', '85mm':'85mm', 広角ズーム:'24-70mm', 望遠ズーム:'70-200mm' },
  aperture: { f1_4:'f1.4', f2_0:'f2.0', f2_8:'f2.8', f5_6:'f5.6', f8_0:'f8.0', f11:'f11' },
  neg: { アニメ風:'cartoon', イラスト風:'illustration', ぼやけ:'blurry', 低解像度:'low resolution', 白飛び:'overexposed', 黒つぶれ:'underexposed', 顔の歪み:'distorted face', 不自然な遠近感:'unnatural perspective' },
  orientation: { 横長:'landscape', 正方形:'square', 縦長:'portrait' },
} as const;

const deriveAspect = (base:string, orientation:'横長'|'正方形'|'縦長'): string => {
  if (base === '1:1') return '1:1';
  if (base === '3:4') return orientation === '横長' ? '4:3' : '3:4';
  if (base === '16:9') return orientation === '縦長' ? '9:16' : '16:9';
  return base;
};

export default function Page() {
  const [mode, setMode] = useState<'人物'|'風景'|'人物+風景'>('人物');
  const [orientation, setOrientation] = useState<'横長'|'正方形'|'縦長'>('正方形');
  const [ratioBase, setRatioBase] = useState<'1:1'|'3:4'|'16:9'>('1:1');

  type Subject = { gender: string; age: string; description: string; clothing: string; accessories: string; emphasis: string; };
  const [subjects, setSubjects] = useState<Subject[]>([{ gender:'指定なし', age:'指定なし', description:'', clothing:'', accessories:'', emphasis:'' }]);
  const addSubject = ()=> subjects.length<3 && setSubjects([...subjects, { gender:'指定なし', age:'指定なし', description:'', clothing:'', accessories:'', emphasis:'' }]);
  const updateSubject = (i:number, k:keyof Subject, v:string)=> { const c=[...subjects]; (c[i] as any)[k]=v; setSubjects(c); };

  const [sceneDesc, setSceneDesc] = useState('');
  const [sceneLocation, setSceneLocation] = useState('');
  const [sceneEmphasis, setSceneEmphasis] = useState('');

  const [cameraType, setCameraType] = useState('一眼レフカメラ');
  const [lens, setLens] = useState('50mm');
  const [aperture, setAperture] = useState('f2_0');
  const [shutter, setShutter] = useState('1/250秒');
  const [iso, setIso] = useState('200');

  const [composition, setComposition] = useState<string[]>(['三分割法','中央配置']);
  const [perspective, setPerspective] = useState('目線の高さ');
  const [depth, setDepth] = useState('浅い被写界深度');
  const [focusSel, setFocusSel] = useState('主題を強調');
  const [ltType, setLtType] = useState('日中の自然光');
  const [ltDir, setLtDir] = useState('横からの光');
  const [kelvin, setKelvin] = useState('5000');
  const [style, setStyle] = useState('シネマティック');

  const [postColor, setPostColor] = useState('自然な色調補正、シネマティックなトーン');
  const [postSharp, setPostSharp] = useState('高精細で主題にくっきり焦点');
  const [postNoise, setPostNoise] = useState('低ノイズ、クリアな画質');
  const [postFinish, setPostFinish] = useState('雑誌の表紙のような仕上げ');
  const [negatives, setNegatives] = useState<string[]>(['アニメ風','イラスト風','ぼやけ','低解像度']);
  const toggleArr = (arr:string[], v:string, setter:(v:string[])=>void)=> arr.includes(v)? setter(arr.filter(x=>x!==v)) : setter([...arr, v]);

  const isLandscape = mode==='風景'; const isPortrait = mode==='人物'; const isBoth = mode==='人物+風景';
  useEffect(()=>{ if (isLandscape) { setLens('35mm'); setAperture('f8_0'); setDepth('深い被写界深度'); }}, [mode]);

  const yaml = useMemo(()=>{
    const subjectBlock = (isPortrait || isBoth) ? subjects.map(s => ({
      description: s.description || undefined,
      gender: (dict as any).gender[s.gender],
      age: (dict as any).age[s.age],
      clothing: s.clothing || undefined,
      accessories: s.accessories || undefined,
      emphasis: s.emphasis || undefined,
    })) : undefined;

    const sceneBlock = (isLandscape || isBoth) ? {
      description: sceneDesc || undefined,
      location: sceneLocation || undefined,
      emphasis: sceneEmphasis || undefined,
    } : undefined;

    const cameraBlock:any = {
      type: cameraType === '一眼レフカメラ' ? 'DSLR' : 'mirrorless',
      lens: `${(dict as any).lens[lens]} ${(dict as any).aperture[aperture]}`.trim(),
      settings: { aperture: (dict as any).aperture[aperture], shutter: shutter.replace('秒','s'), iso }
    };

    const compositionBlock:any = {
      framing: composition.map(c=>(dict as any).composition[c]).filter(Boolean).join(', ') || undefined,
      depth: (dict as any).depth[depth],
      perspective: (dict as any).perspective[perspective],
    };

    const lightingBlock:any = {
      type: (dict as any).lightingType[ltType],
      color_temperature: `${kelvin}K`,
      description: ltType === '日中の自然光' ? 'bright and refreshing midday sunlight, soft shadows' : undefined,
      direction: (dict as any).lightDir[ltDir],
    };

    const focusText = (dict as any).focus[focusSel];

    const obj:any = {
      output: {
        orientation: (dict as any).orientation[orientation] || 'square',
        aspect_ratio: deriveAspect(ratioBase, orientation),
      },
      prompt: {
        mode: (dict as any).mode[mode],
        ...(subjectBlock ? { subject: subjectBlock } : {}),
        ...(sceneBlock ? { scene: sceneBlock } : {}),
        style: `${(dict as any).style[style]} photography, natural lighting`,
        camera: cameraBlock,
        composition: compositionBlock,
        focus: focusText,
        lighting: lightingBlock,
        mood: style==='シネマティック' ? 'natural, refined, cinematic atmosphere' : undefined,
        postprocessing: {
          color: postColor ? 'natural color grading, cinematic tones' : undefined,
          sharpness: postSharp ? 'high detail, crisp focus' : undefined,
          noise: postNoise ? 'low noise, clean image' : undefined,
          finish: postFinish ? 'magazine editorial quality' : undefined,
        },
      },
      negative_prompt: negatives.map(n=>(dict as any).neg[n]).filter(Boolean),
    };

    const indent = (n:number)=>' '.repeat(n);
    const dump = (k:any,v:any,lv=0):string => {
      const key = typeof k==='string'? k: String(k);
      if (v===undefined || v===null || v==='') return '';
      if (Array.isArray(v)) {
        if (!v.length) return '';
        const items = v.map(x=> typeof x==='object'? dump('-',x,lv+2) : `${indent(lv+2)}- ${x}\n`).join('');
        return `${indent(lv)}${key}:\n${items}`;
      }
      if (typeof v==='object') {
        const entries = Object.entries(v).filter(([,vv])=> vv!==undefined && vv!==null && vv!=='');
        if (!entries.length) return '';
        return `${indent(lv)}${key}:\n` + entries.map(([kk,vv])=> dump(kk,vv,lv+2)).join('');
      }
      return `${indent(lv)}${key}: ${String(v)}\n`;
    };

    let out='';
    out += dump('output', obj.output, 0);
    out += dump('prompt', obj.prompt, 0);
    out += dump('negative_prompt', obj.negative_prompt, 0);
    return out.trim();
  }, [mode, subjects, sceneDesc, sceneLocation, sceneEmphasis, cameraType, lens, aperture, shutter, iso, composition, perspective, depth, ltType, ltDir, kelvin, style, postColor, postSharp, postNoise, postFinish, negatives, focusSel, orientation, ratioBase]);

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto space-y-6">
      <motion.h1 initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">YAML Prompt Builder（日本語選択 → 英語出力）</motion.h1>

      <Card className="card">
        <CardContent>
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-slate-800">0. 出力サイズ</h3>
            <p className="text-sm text-slate-600/80">向きとアスペクト比を選択（比率は 1:1 / 3:4 / 16:9 のいずれか）</p>
          </div>
          <div className="flex gap-2 mb-2">
            {(['横長','正方形','縦長'] as const).map(o => (
              <Button key={o} variant={orientation===o?'default':'secondary'} onClick={()=> setOrientation(o)}>{o}</Button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['1:1','3:4','16:9'] as const).map(r => (
              <label key={r} className="flex items-center gap-2 text-sm">
                <input type="radio" name="aspect" className="h-4 w-4" checked={ratioBase===r} onChange={()=> setRatioBase(r)} /> {r}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card">
        <CardContent>
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-slate-800">1. タイプを選択</h3>
            <p className="text-sm text-slate-600/80">選択したタイプに応じて、以下の入力項目が切り替わります</p>
          </div>
          <div className="flex gap-2">
            {(['人物','風景','人物+風景'] as const).map(m => (
              <Button key={m} variant={mode===m?'default':'secondary'} onClick={()=> setMode(m)}>{m}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {(mode==='人物' || mode==='人物+風景') && (
        <Card className="card">
          <CardContent className="space-y-4">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-slate-800">2. 被写体（最大3人）</h3>
              <p className="text-sm text-slate-600/80">性別・年齢は選択、説明・服装・持ち物・強調ポイントは自由記述</p>
            </div>

            {subjects.map((s, idx)=>(
              <div key={idx} className="border border-white/70 bg-white/60 rounded-xl p-3 space-y-2">
                <Label>人物{idx+1} 説明</Label>
                <Textarea value={s.description} onChange={e=> updateSubject(idx,'description',e.target.value)} placeholder="例：神社の庭園で微笑む庭師" />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>性別</Label>
                    <select className="input" value={s.gender} onChange={e=> updateSubject(idx,'gender',e.target.value)}>
                      {Object.keys(dict.gender).map(k=>(<option key={k} value={k}>{k}</option>))}
                    </select>
                  </div>
                  <div>
                    <Label>年齢</Label>
                    <select className="input" value={s.age} onChange={e=> updateSubject(idx,'age',e.target.value)}>
                      {Object.keys(dict.age).map(k=>(<option key={k} value={k}>{k}</option>))}
                    </select>
                  </div>
                </div>
                <Label>服装（自由記述）</Label>
                <Input value={s.clothing} onChange={e=> updateSubject(idx,'clothing',e.target.value)} />
                <Label>持ち物（自由記述）</Label>
                <Input value={s.accessories} onChange={e=> updateSubject(idx,'accessories',e.target.value)} />
                <Label>強調したい要素（自由記述）</Label>
                <Input value={s.emphasis} onChange={e=> updateSubject(idx,'emphasis',e.target.value)} />
              </div>
            ))}
            {subjects.length<3 && <Button onClick={addSubject}>人物を追加</Button>}
          </CardContent>
        </Card>
      )}

      {(mode==='風景' || mode==='人物+風景') && (
        <Card className="card">
          <CardContent className="space-y-3">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-slate-800">2. 風景の設定</h3>
              <p className="text-sm text-slate-600/80">説明・場所・強調ポイントは自由記述</p>
            </div>
            <Label>風景の説明</Label>
            <Textarea value={sceneDesc} onChange={e=> setSceneDesc(e.target.value)} placeholder="例：苔むした石畳と朱色の鳥居、新緑、澄んだ青空" />
            <Label className="mt-2">場所・ロケーション</Label>
            <Input value={sceneLocation} onChange={e=> setSceneLocation(e.target.value)} placeholder="例：日本の神社の庭園、伝統建築に囲まれた場所" />
            <Label className="mt-2">強調したい要素（自由記述）</Label>
            <Input value={sceneEmphasis} onChange={e=> setSceneEmphasis(e.target.value)} placeholder="例：前景の石畳のテクスチャと鳥居の朱色" />
          </CardContent>
        </Card>
      )}

      <Card className="card">
        <CardContent className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">3. カメラ / レンズ / 露出</h3>
          <Label>カメラ</Label>
          <select className="input" value={cameraType} onChange={e=> setCameraType(e.target.value)}>
            <option value="一眼レフカメラ">一眼レフカメラ</option>
            <option value="ミラーレス">ミラーレス</option>
          </select>
          <div className="grid md:grid-cols-3 gap-2 mt-2">
            <div>
              <Label>レンズ</Label>
              <select className="input" value={lens} onChange={e=> setLens(e.target.value)}>
                {Object.keys(dict.lens).map(k=>(<option key={k} value={k}>{k}</option>))}
              </select>
            </div>
            <div>
              <Label>絞り</Label>
              <select className="input" value={aperture} onChange={e=> setAperture(e.target.value)}>
                {Object.keys(dict.aperture).map(k=>(<option key={k} value={k}>{(dict as any).aperture[k]}</option>))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>シャッター</Label>
                <Input value={shutter} onChange={e=> setShutter(e.target.value)} placeholder="例：1/250秒" />
              </div>
              <div>
                <Label>ISO</Label>
                <Input value={iso} onChange={e=> setIso(e.target.value)} placeholder="100" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card">
        <CardContent className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">4. 構図 / ピント / ライティング</h3>
          <Label>構図（複数選択可）</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(dict.composition).map(k => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <Checkbox checked={composition.includes(k)} onChange={()=> toggleArr(composition,k,setComposition)} /> {k}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <Label>視点</Label>
              <select className="input" value={perspective} onChange={e=> setPerspective(e.target.value)}>
                {Object.keys(dict.perspective).map(k=>(<option key={k} value={k}>{k}</option>))}
              </select>
            </div>
            <div>
              <Label>被写界深度</Label>
              <select className="input" value={depth} onChange={e=> setDepth(e.target.value)}>
                {Object.keys(dict.depth).map(k=>(<option key={k} value={k}>{k}</option>))}
              </select>
            </div>
          </div>
          <Label className="mt-2">焦点の当て方</Label>
          <select className="input" value={focusSel} onChange={e=> setFocusSel(e.target.value)}>
            {Object.keys(dict.focus).map(k=>(<option key={k} value={k}>{k}</option>))}
          </select>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <Label>光の種類</Label>
              <select className="input" value={ltType} onChange={e=> setLtType(e.target.value)}>
                {Object.keys(dict.lightingType).map(k=>(<option key={k} value={k}>{k}</option>))}
              </select>
            </div>
            <div>
              <Label>光の方向</Label>
              <select className="input" value={ltDir} onChange={e=> setLtDir(e.target.value)}>
                {Object.keys(dict.lightDir).map(k=>(<option key={k} value={k}>{k}</option>))}
              </select>
            </div>
            <div>
              <Label>色温度（K）</Label>
              <Input value={kelvin} onChange={e=> setKelvin(e.target.value)} placeholder="5000" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card">
        <CardContent className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">5. 仕上げ / ネガティブ</h3>
          <Label>色調（任意メモ）</Label>
          <Input value={postColor} onChange={e=> setPostColor(e.target.value)} />
          <Label className="mt-2">シャープ/ノイズ/仕上げ（任意メモ）</Label>
          <Input value={postSharp} onChange={e=> setPostSharp(e.target.value)} className="mb-1" />
          <Input value={postNoise} onChange={e=> setPostNoise(e.target.value)} className="mb-1" />
          <Input value={postFinish} onChange={e=> setPostFinish(e.target.value)} />
          <Label className="mt-3">除外したい要素（複数選択可）</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(dict.neg).map(k => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <Checkbox checked={negatives.includes(k)} onChange={()=> toggleArr(negatives,k,setNegatives)} /> {k}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card">
        <CardContent className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">出力（英語YAML）</h3>
          <Textarea className="font-mono text-sm h-80" value={yaml} readOnly />
          <div className="flex gap-2">
            <Button onClick={()=> navigator.clipboard.writeText(yaml)}>YAMLをコピー</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
