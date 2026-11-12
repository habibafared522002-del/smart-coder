import React, { useState } from 'react';
import { Cpu, Zap, Radio, Sparkles, CheckCircle2, Play, RotateCcw, Sliders } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales/translations';

interface StemLabsViewProps {
  language: Language;
}

export const StemLabsView: React.FC<StemLabsViewProps> = ({ language }) => {
  const t = translations[language];
  const isAr = language === 'ar';
  const [activeLab, setActiveLab] = useState<'programming' | 'electronics' | 'sensors' | 'creative' | 'logic'>('programming');

  // Electronics lab state
  const [wireConnected, setWireConnected] = useState(false);
  const [ledOn, setLedOn] = useState(false);

  // Sensors lab state
  const [lightLevel, setLightLevel] = useState(50);
  const [distanceVal, setDistanceVal] = useState(30);

  // Programming playground state
  const [commands, setCommands] = useState<string[]>([]);
  const [programStatus, setProgramStatus] = useState<string>('');

  const handleConnectWire = () => {
    setWireConnected(true);
    setLedOn(true);
  };

  const handleResetElectronics = () => {
    setWireConnected(false);
    setLedOn(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {isAr ? 'المعامل التفاعلية والمخابر الذكية' : 'Interactive STEM Labs'}
            </span>
            <h2 className="text-3xl font-black mt-2">
              {isAr ? 'استكشف التجربة والابتكار العملي' : 'Experience Hands-on STEM Learning'}
            </h2>
            <p className="text-white/90 text-sm mt-1">
              {isAr ? 'معامل تفاعلية بالكامل للبرمجة، الإلكترونيات، المستشعرات والمنطق.' : 'Fully interactive labs for programming, electronics, sensors and logic.'}
            </p>
          </div>
        </div>

        {/* Labs Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveLab('programming')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
              activeLab === 'programming'
                ? 'bg-red-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Cpu className="w-5 h-5" />
            <span>{isAr ? 'معمل البرمجة' : 'Programming Lab'}</span>
          </button>

          <button
            onClick={() => setActiveLab('electronics')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
              activeLab === 'electronics'
                ? 'bg-red-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span>{isAr ? 'معمل الإلكترونيات' : 'Electronics Lab'}</span>
          </button>

          <button
            onClick={() => setActiveLab('sensors')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
              activeLab === 'sensors'
                ? 'bg-red-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Radio className="w-5 h-5" />
            <span>{isAr ? 'معمل المستشعرات' : 'Sensors Lab'}</span>
          </button>
        </div>

        {/* Lab 1: Programming Playground */}
        {activeLab === 'programming' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {isAr ? '🎮 معمل برمجة الروبوت التفاعلي' : '🎮 Interactive Robot Programming Playground'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              {isAr ? 'أضف الأوامر البرمجية وشاهد الروبوت ينفذها مباشرة في بيئة المعمل.' : 'Add commands and watch the robot execute them live in the lab environment.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-4">
                    {isAr ? 'قائمة الأوامر المتاحة:' : 'Available Commands:'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={() => setCommands([...commands, 'MOVE_FORWARD'])}
                      className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl font-bold text-xs shadow-md"
                    >
                      ⬆️ {isAr ? 'تحرك للأمام' : 'Move Forward'}
                    </button>
                    <button
                      onClick={() => setCommands([...commands, 'TURN_RIGHT'])}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-bold text-xs shadow-md"
                    >
                      ➡️ {isAr ? 'استدر لليمين' : 'Turn Right'}
                    </button>
                    <button
                      onClick={() => setCommands([...commands, 'TURN_LEFT'])}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-bold text-xs shadow-md"
                    >
                      ⬅️ {isAr ? 'استدر لليسار' : 'Turn Left'}
                    </button>
                    <button
                      onClick={() => setCommands([...commands, 'SAY_HELLO'])}
                      className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-xl font-bold text-xs shadow-md"
                    >
                      💬 {isAr ? 'تحدث!' : 'Say Hello'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setProgramStatus(isAr ? '🤖 جاري تنفيذ البرنامج بنجاح!' : '🤖 Executing program successfully!');
                      setTimeout(() => setProgramStatus(''), 2500);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4" />
                    <span>{t.runCode}</span>
                  </button>
                  <button
                    onClick={() => {
                      setCommands([]);
                      setProgramStatus('');
                    }}
                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 rounded-xl font-bold"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Execution Visualizer */}
              <div className="bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center text-white relative overflow-hidden min-h-[300px] border border-slate-800 shadow-inner">
                <span className="text-6xl mb-4 animate-bounce">🤖</span>
                <div className="w-full max-w-xs bg-slate-800 p-4 rounded-xl mb-4 min-h-[80px] border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-2">{isAr ? 'الأوامر الحالية:' : 'Current Code Queue:'}</span>
                  <div className="flex flex-wrap gap-1">
                    {commands.length === 0 ? (
                      <span className="text-slate-500 text-xs italic">{isAr ? 'لا توجد أوامر...' : 'No commands added...'}</span>
                    ) : (
                      commands.map((c, i) => (
                        <span key={i} className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                          {c}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                {programStatus && (
                  <div className="text-emerald-400 font-bold text-sm bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-800 animate-pulse">
                    {programStatus}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lab 2: Virtual Electronics Lab */}
        {activeLab === 'electronics' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {isAr ? '⚡ معمل الإلكترونيات الافتراضي (Virtual Electronics)' : '⚡ Virtual Electronics Lab'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              {isAr ? 'قم بتوصيل الأسلاك باللوحة والمصباح (LED) لاختبار الدائرة الكهربائية البسيطة.' : 'Connect wires to the breadboard and LED to test the simple electrical circuit.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                    {isAr ? 'حالة الدائرة الكهربائية:' : 'Circuit Status:'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${wireConnected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                    {wireConnected ? (isAr ? 'مكتملة ومضاءة ✅' : 'Connected & Active ✅') : (isAr ? 'غير مكتملة ⚠️' : 'Incomplete ⚠️')}
                  </span>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleConnectWire}
                    disabled={wireConnected}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors disabled:opacity-50"
                  >
                    {isAr ? 'توصيل الأسلاك الكهربائية' : 'Connect Wires'}
                  </button>
                  <button
                    onClick={handleResetElectronics}
                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 rounded-xl font-bold"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Workbench Simulation Visualizer */}
              <div className="bg-slate-900 rounded-2xl p-8 flex flex-col items-center justify-center text-white border border-slate-800 shadow-inner min-h-[260px]">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4 transition-all duration-500 shadow-2xl" style={{ backgroundColor: ledOn ? '#ef4444' : '#334155', boxShadow: ledOn ? '0 0 30px #ef4444' : 'none' }}>
                  💡
                </div>
                <h4 className="font-bold text-lg mb-1">
                  {ledOn ? (isAr ? 'المصباح مضيء بنجاح!' : 'LED is glowing!') : (isAr ? 'المصباح متوقف' : 'LED is OFF')}
                </h4>
                <p className="text-xs text-slate-400">
                  {isAr ? 'قم بالتوصيل لإكمال الدائرة الكهربائية' : 'Connect wires to complete circuit'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lab 3: Sensors Lab */}
        {activeLab === 'sensors' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {isAr ? '📡 معمل مستشعرات الروبوت الذكية' : '📡 Robot Smart Sensors Lab'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              {isAr ? 'تحكم في مستشعر الضوء ومستشعر المسافة ولاحظ استجابة الروبوت الفورية.' : 'Control light and distance sensors and observe real-time robot response.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {isAr ? `مستوى الإضاءة المحيطة: ${lightLevel}%` : `Ambient Light Level: ${lightLevel}%`}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lightLevel}
                    onChange={(e) => setLightLevel(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {isAr ? `مسافة العائق (سم): ${distanceVal} سم` : `Obstacle Distance: ${distanceVal} cm`}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={distanceVal}
                    onChange={(e) => setDistanceVal(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
              </div>

              {/* Sensor Response Box */}
              <div className="bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center text-white border border-slate-800 shadow-inner">
                <span className="text-5xl mb-4">🤖</span>
                <div className="text-center space-y-2">
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {lightLevel < 30 ? (isAr ? 'وضع الليل (تفعيل إضاءة LED)' : 'Night Mode (LED ON)') : (isAr ? 'وضع النهار' : 'Day Mode')}
                  </span>
                  <p className="text-xs text-slate-300">
                    {distanceVal < 25 ? (isAr ? '⚠️ تحذير: عائق قريب جداً! توقف الروبوت.' : '⚠️ Warning: Obstacle close! Robot stopping.') : (isAr ? '✅ الطريق آمن للتقدم للأمام.' : '✅ Path clear for movement.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
