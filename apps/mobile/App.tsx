import 'react-native-get-random-values'

import React, { useEffect } from 'react'
import { atom, useAtom } from 'jotai'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import type {
  Certification,
  Education,
  Experience,
  Language,
  PersonalInfo,
  Project,
  ResumeData,
  ResumeSection,
  Skill,
} from '@resume-builder/core'
import {
  createDefaultResumeData,
  createDefaultSections,
  createEmptySectionItem,
  moveSection,
  STORAGE_KEYS,
  updateSectionData,
} from '@resume-builder/core'
import { asyncStorageAdapter, expoFileAdapter } from './src/adapters/mobileAdapters'
import { ResumePreview } from './src/components/ResumePreview'

type ActiveTab = 'edit' | 'preview' | 'data'
type EditableSectionType = Exclude<ResumeSection['type'], 'personalInfo'>

const resumeDataAtom = atom<ResumeData>(createDefaultResumeData())
const isHydratedAtom = atom(false)
const activeTabAtom = atom<ActiveTab>('edit')
const feedbackAtom = atom<string | null>(null)

const defaultSections = createDefaultSections()

const appCopy = {
  title: 'Resume Builder Mobile',
  kicker: 'MVP / React Native',
  empty: '还没有内容，点一下“新增条目”开始。',
}

const getFallbackSection = (sectionType: EditableSectionType): ResumeSection =>
  defaultSections.find((section) => section.type === sectionType) || {
    type: sectionType,
    title: sectionType,
    data: [],
    visible: true,
    order: defaultSections.length,
  }

export default function App() {
  const [resumeData, setResumeData] = useAtom(resumeDataAtom)
  const [isHydrated, setIsHydrated] = useAtom(isHydratedAtom)
  const [activeTab, setActiveTab] = useAtom(activeTabAtom)
  const [feedback, setFeedback] = useAtom(feedbackAtom)

  useEffect(() => {
    let mounted = true

    const hydrate = async () => {
      try {
        const saved = await asyncStorageAdapter.getItem<ResumeData>(STORAGE_KEYS.resumeData)
        if (saved && mounted) {
          setResumeData(saved)
        }
      } catch (error) {
        if (mounted) {
          setFeedback(error instanceof Error ? error.message : '本地数据读取失败')
        }
      } finally {
        if (mounted) {
          setIsHydrated(true)
        }
      }
    }

    hydrate()
    return () => {
      mounted = false
    }
  }, [setFeedback, setIsHydrated, setResumeData])

  useEffect(() => {
    if (!isHydrated) return

    const timeout = setTimeout(() => {
      asyncStorageAdapter
        .setItem(STORAGE_KEYS.resumeData, resumeData)
        .catch((error) => setFeedback(error instanceof Error ? error.message : '自动保存失败'))
    }, 350)

    return () => clearTimeout(timeout)
  }, [isHydrated, resumeData, setFeedback])

  const mutateResume = (updater: (current: ResumeData) => ResumeData) => {
    setResumeData((current) => {
      const next = updater(current)
      return {
        ...next,
        metadata: {
          ...next.metadata,
          lastModified: Date.now(),
        },
      }
    })
  }

  const updatePersonalInfo = <K extends keyof PersonalInfo>(field: K, value: PersonalInfo[K]) => {
    mutateResume((current) => ({
      ...current,
      personalInfo: {
        ...current.personalInfo,
        [field]: value,
      },
    }))
  }

  const updateSectionItems = (
    sectionType: EditableSectionType,
    updater: (items: any[]) => any[]
  ) => {
    mutateResume((current) => ({
      ...current,
      sections: updateSectionData(current.sections, sectionType, (section) => {
        const fallback = section || getFallbackSection(sectionType)
        return {
          ...fallback,
          data: updater(Array.isArray(fallback.data) ? fallback.data : []),
        }
      }),
    }))
  }

  const addSectionItem = (sectionType: EditableSectionType) => {
    updateSectionItems(sectionType, (items) => [...items, createEmptySectionItem(sectionType)])
  }

  const updateSectionItem = (
    sectionType: EditableSectionType,
    itemIndex: number,
    updater: (item: any) => any
  ) => {
    updateSectionItems(sectionType, (items) =>
      items.map((item, index) => (index === itemIndex ? updater(item) : item))
    )
  }

  const removeSectionItem = (sectionType: EditableSectionType, itemIndex: number) => {
    updateSectionItems(sectionType, (items) => items.filter((_, index) => index !== itemIndex))
  }

  const moveSectionByDelta = (index: number, delta: number) => {
    mutateResume((current) => ({
      ...current,
      sections: moveSection(current.sections, index, index + delta),
    }))
  }

  const toggleSectionVisible = (index: number) => {
    mutateResume((current) => {
      const nextSections = [...current.sections]
      nextSections[index] = {
        ...nextSections[index],
        visible: !nextSections[index].visible,
      }
      return { ...current, sections: nextSections }
    })
  }

  const importJson = async () => {
    try {
      const data = await expoFileAdapter.importJson()
      setResumeData(data)
      setFeedback('JSON 已导入，当前内容已替换。')
      setActiveTab('edit')
    } catch (error) {
      const message = error instanceof Error ? error.message : '导入失败'
      if (message !== '已取消导入') {
        Alert.alert('导入失败', message)
      }
    }
  }

  const exportJson = async () => {
    try {
      await expoFileAdapter.exportJson(resumeData)
      setFeedback('JSON 已导出，可以直接分享或保存。')
    } catch (error) {
      Alert.alert('导出失败', error instanceof Error ? error.message : '导出失败')
    }
  }

  const resetResume = () => {
    Alert.alert('新建简历', '会清空当前移动端内容，确定继续吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确认',
        style: 'destructive',
        onPress: () => {
          const next = createDefaultResumeData()
          setResumeData(next)
          setFeedback('已创建新的空白简历。')
        },
      },
    ])
  }

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.loadingShell}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#9a6b34" />
        <Text style={styles.loadingText}>正在加载你的移动端简历工作台…</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{appCopy.kicker}</Text>
          <Text style={styles.title}>{appCopy.title}</Text>
          <Text style={styles.subtitle}>
            共享桌面端的数据结构，先把编辑、预览和 JSON 流程跑通。
          </Text>
        </View>

        <View style={styles.tabBar}>
          <TabButton active={activeTab === 'edit'} onPress={() => setActiveTab('edit')} label="编辑" />
          <TabButton active={activeTab === 'preview'} onPress={() => setActiveTab('preview')} label="预览" />
          <TabButton active={activeTab === 'data'} onPress={() => setActiveTab('data')} label="数据" />
        </View>

        {!!feedback && (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        {activeTab === 'edit' && (
          <View style={styles.stack}>
            <Panel title="简历标题" description="这个标题会作为导出文件名和预览副标题。">
              <Field
                label="标题"
                value={resumeData.metadata.title}
                onChangeText={(value) =>
                  mutateResume((current) => ({
                    ...current,
                    metadata: { ...current.metadata, title: value },
                  }))
                }
                placeholder="例如：产品经理简历"
              />
            </Panel>

            <Panel title="个人信息" description="移动端首期先聚焦核心资料输入。">
              <Field label="姓名" value={resumeData.personalInfo.name} onChangeText={(value) => updatePersonalInfo('name', value)} />
              <Field label="邮箱" value={resumeData.personalInfo.email} onChangeText={(value) => updatePersonalInfo('email', value)} keyboardType="email-address" />
              <Field label="电话" value={resumeData.personalInfo.phone} onChangeText={(value) => updatePersonalInfo('phone', value)} keyboardType="phone-pad" />
              <Field label="所在地" value={resumeData.personalInfo.location} onChangeText={(value) => updatePersonalInfo('location', value)} />
              <Field label="网站" value={resumeData.personalInfo.website || ''} onChangeText={(value) => updatePersonalInfo('website', value)} autoCapitalize="none" />
              <Field
                label="个人简介"
                value={resumeData.personalInfo.summary || ''}
                onChangeText={(value) => updatePersonalInfo('summary', value)}
                multiline
                placeholder="一句话概括你的经验、方向和亮点。"
              />
            </Panel>

            {resumeData.sections
              .slice()
              .sort((left, right) => left.order - right.order)
              .map((section, index, sections) => (
                <Panel
                  key={section.type}
                  title={section.title}
                  description={`排序 ${index + 1} / ${sections.length}`}
                  headerRight={
                    <View style={styles.inlineActions}>
                      <MiniButton label={section.visible ? '隐藏' : '显示'} onPress={() => toggleSectionVisible(index)} />
                      <MiniButton label="上移" disabled={index === 0} onPress={() => moveSectionByDelta(index, -1)} />
                      <MiniButton
                        label="下移"
                        disabled={index === sections.length - 1}
                        onPress={() => moveSectionByDelta(index, 1)}
                      />
                    </View>
                  }
                >
                  <SectionEditor
                    section={section as ResumeSection<any>}
                    emptyText={appCopy.empty}
                    onAdd={() => addSectionItem(section.type as EditableSectionType)}
                    onRemove={(itemIndex) => removeSectionItem(section.type as EditableSectionType, itemIndex)}
                    onUpdate={(itemIndex, updater) => updateSectionItem(section.type as EditableSectionType, itemIndex, updater)}
                  />
                </Panel>
              ))}
          </View>
        )}

        {activeTab === 'preview' && <ResumePreview data={resumeData} />}

        {activeTab === 'data' && (
          <View style={styles.stack}>
            <Panel title="数据流转" description="首期先打通 JSON 导入导出和本地持久化。">
              <ActionButton label="导入 JSON" onPress={importJson} variant="secondary" />
              <ActionButton label="导出 JSON" onPress={exportJson} />
              <ActionButton label="新建简历" onPress={resetResume} variant="ghost" />
            </Panel>

            <Panel title="当前状态" description="这些数据能帮助你快速确认移动端 MVP 是否正常工作。">
              <InfoRow label="区块数量" value={`${resumeData.sections.length}`} />
              <InfoRow label="最后修改" value={new Date(resumeData.metadata.lastModified).toLocaleString()} />
              <InfoRow label="显示中的区块" value={`${resumeData.sections.filter((section) => section.visible).length}`} />
            </Panel>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const SectionEditor = ({
  section,
  onAdd,
  onRemove,
  onUpdate,
  emptyText,
}: {
  section: ResumeSection<any>
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, updater: (item: any) => any) => void
  emptyText: string
}) => {
  const items = Array.isArray(section.data) ? section.data : []

  return (
    <View style={styles.sectionEditor}>
      {items.map((item, index) => (
        <View key={item.id || `${section.type}-${index}`} style={styles.itemCard}>
          <View style={styles.itemCardHeader}>
            <Text style={styles.itemCardTitle}>条目 {index + 1}</Text>
            <MiniButton label="删除" onPress={() => onRemove(index)} />
          </View>
          {renderFields(section.type as EditableSectionType, item, (updater) => onUpdate(index, updater))}
        </View>
      ))}

      {!items.length && <Text style={styles.emptyText}>{emptyText}</Text>}

      <ActionButton label="新增条目" onPress={onAdd} variant="secondary" />
    </View>
  )
}

const renderFields = (
  sectionType: EditableSectionType,
  item: Education | Experience | Skill | Project | Certification | Language,
  onChange: (updater: (item: any) => any) => void
) => {
  switch (sectionType) {
    case 'education':
      return (
        <>
          <Field label="学校" value={(item as Education).school} onChangeText={(value) => onChange((current) => ({ ...current, school: value }))} />
          <Field label="学位" value={(item as Education).degree} onChangeText={(value) => onChange((current) => ({ ...current, degree: value }))} />
          <Field label="专业" value={(item as Education).major} onChangeText={(value) => onChange((current) => ({ ...current, major: value }))} />
          <Field label="开始日期" value={(item as Education).startDate} onChangeText={(value) => onChange((current) => ({ ...current, startDate: value }))} placeholder="2024-09" />
          <Field label="结束日期" value={(item as Education).endDate || ''} onChangeText={(value) => onChange((current) => ({ ...current, endDate: value }))} placeholder="2026-06" />
          <Field label="描述" value={(item as Education).description || ''} onChangeText={(value) => onChange((current) => ({ ...current, description: value }))} multiline />
        </>
      )
    case 'experience':
      return (
        <>
          <Field label="公司" value={(item as Experience).company} onChangeText={(value) => onChange((current) => ({ ...current, company: value }))} />
          <Field label="岗位" value={(item as Experience).position} onChangeText={(value) => onChange((current) => ({ ...current, position: value }))} />
          <Field label="城市" value={(item as Experience).location || ''} onChangeText={(value) => onChange((current) => ({ ...current, location: value }))} />
          <Field label="开始日期" value={(item as Experience).startDate} onChangeText={(value) => onChange((current) => ({ ...current, startDate: value }))} placeholder="2023-01" />
          <Field label="结束日期" value={(item as Experience).endDate || ''} onChangeText={(value) => onChange((current) => ({ ...current, endDate: value }))} placeholder="2024-12" />
          <Field label="工作描述" value={(item as Experience).description} onChangeText={(value) => onChange((current) => ({ ...current, description: value }))} multiline />
          <Field
            label="成果（用逗号分隔）"
            value={(item as Experience).achievements.join(', ')}
            onChangeText={(value) => onChange((current) => ({ ...current, achievements: splitList(value) }))}
            multiline
          />
        </>
      )
    case 'skills':
      return (
        <>
          <Field label="技能" value={(item as Skill).name} onChangeText={(value) => onChange((current) => ({ ...current, name: value }))} />
          <Field label="分类" value={(item as Skill).category || ''} onChangeText={(value) => onChange((current) => ({ ...current, category: value }))} />
          <Field
            label="等级（1-5）"
            value={String((item as Skill).level)}
            keyboardType="number-pad"
            onChangeText={(value) =>
              onChange((current) => ({
                ...current,
                level: clampSkillLevel(value),
              }))
            }
          />
        </>
      )
    case 'projects':
      return (
        <>
          <Field label="项目名" value={(item as Project).name} onChangeText={(value) => onChange((current) => ({ ...current, name: value }))} />
          <Field label="链接" value={(item as Project).url || ''} onChangeText={(value) => onChange((current) => ({ ...current, url: value }))} autoCapitalize="none" />
          <Field label="开始日期" value={(item as Project).startDate || ''} onChangeText={(value) => onChange((current) => ({ ...current, startDate: value }))} placeholder="2024-01" />
          <Field label="结束日期" value={(item as Project).endDate || ''} onChangeText={(value) => onChange((current) => ({ ...current, endDate: value }))} placeholder="2024-06" />
          <Field label="项目描述" value={(item as Project).description} onChangeText={(value) => onChange((current) => ({ ...current, description: value }))} multiline />
          <Field
            label="技术栈（用逗号分隔）"
            value={(item as Project).technologies.join(', ')}
            onChangeText={(value) => onChange((current) => ({ ...current, technologies: splitList(value) }))}
            multiline
          />
        </>
      )
    case 'certifications':
      return (
        <>
          <Field label="证书名" value={(item as Certification).name} onChangeText={(value) => onChange((current) => ({ ...current, name: value }))} />
          <Field label="颁发机构" value={(item as Certification).issuer} onChangeText={(value) => onChange((current) => ({ ...current, issuer: value }))} />
          <Field label="日期" value={(item as Certification).date} onChangeText={(value) => onChange((current) => ({ ...current, date: value }))} placeholder="2024-03" />
          <Field label="链接" value={(item as Certification).url || ''} onChangeText={(value) => onChange((current) => ({ ...current, url: value }))} autoCapitalize="none" />
        </>
      )
    case 'languages':
      return (
        <>
          <Field label="语言" value={(item as Language).name} onChangeText={(value) => onChange((current) => ({ ...current, name: value }))} />
          <Field
            label="等级"
            value={(item as Language).proficiency}
            onChangeText={(value) => onChange((current) => ({ ...current, proficiency: normalizeProficiency(value) }))}
            placeholder="native / fluent / advanced / intermediate / basic"
            autoCapitalize="none"
          />
        </>
      )
  }
}

const TabButton = ({ active, onPress, label }: { active: boolean; onPress: () => void; label: string }) => (
  <Pressable onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
  </Pressable>
)

const ActionButton = ({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
}) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.actionButton,
      variant === 'secondary' && styles.actionButtonSecondary,
      variant === 'ghost' && styles.actionButtonGhost,
    ]}
  >
    <Text
      style={[
        styles.actionLabel,
        variant === 'secondary' && styles.actionLabelSecondary,
        variant === 'ghost' && styles.actionLabelGhost,
      ]}
    >
      {label}
    </Text>
  </Pressable>
)

const MiniButton = ({
  label,
  onPress,
  disabled = false,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) => (
  <Pressable onPress={onPress} disabled={disabled} style={[styles.miniButton, disabled && styles.miniButtonDisabled]}>
    <Text style={[styles.miniButtonText, disabled && styles.miniButtonTextDisabled]}>{label}</Text>
  </Pressable>
)

const Panel = ({
  title,
  description,
  children,
  headerRight,
}: {
  title: string
  description: string
  children: React.ReactNode
  headerRight?: React.ReactNode
}) => (
  <View style={styles.panel}>
    <View style={styles.panelHeader}>
      <View style={styles.panelHeaderText}>
        <Text style={styles.panelTitle}>{title}</Text>
        <Text style={styles.panelDescription}>{description}</Text>
      </View>
      {headerRight}
    </View>
    <View style={styles.panelBody}>{children}</View>
  </View>
)

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
  autoCapitalize = 'sentences',
}: {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  multiline?: boolean
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
}) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      style={[styles.input, multiline && styles.inputMultiline]}
      placeholderTextColor="#9aa3ab"
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
  </View>
)

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
)

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const clampSkillLevel = (value: string): Skill['level'] => {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return 3
  return Math.min(5, Math.max(1, parsed)) as Skill['level']
}

const normalizeProficiency = (value: string): Language['proficiency'] => {
  const normalized = value.trim().toLowerCase()
  if (['native', 'fluent', 'advanced', 'intermediate', 'basic'].includes(normalized)) {
    return normalized as Language['proficiency']
  }
  return 'intermediate'
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4efe6',
  },
  loadingShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#f4efe6',
  },
  loadingText: {
    fontSize: 15,
    color: '#4c5b6a',
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 18,
  },
  header: {
    padding: 24,
    borderRadius: 28,
    backgroundColor: '#1c2a39',
    gap: 6,
  },
  kicker: {
    color: '#c6d7e8',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#fefbf6',
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: '#dbe6f1',
    fontSize: 14,
    lineHeight: 22,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fffaf1',
    borderRadius: 999,
    padding: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: '#eadfcd',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#9a6b34',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#51606f',
  },
  tabLabelActive: {
    color: '#fffaf3',
  },
  feedback: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#efe4d3',
  },
  feedbackText: {
    color: '#68471f',
    fontSize: 13,
  },
  stack: {
    gap: 16,
  },
  panel: {
    backgroundColor: '#fffdf8',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#eadfcd',
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#fcf6ec',
  },
  panelHeaderText: {
    flex: 1,
    gap: 4,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2d3b',
  },
  panelDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64707d',
  },
  panelBody: {
    padding: 18,
    gap: 16,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4c5968',
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dfd4c4',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#182533',
  },
  inputMultiline: {
    minHeight: 108,
    textAlignVertical: 'top',
  },
  sectionEditor: {
    gap: 14,
  },
  itemCard: {
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#f8f2e8',
    gap: 12,
  },
  itemCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#243241',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#7b8794',
    fontStyle: 'italic',
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1c2a39',
    paddingHorizontal: 18,
  },
  actionButtonSecondary: {
    backgroundColor: '#efe4d3',
  },
  actionButtonGhost: {
    backgroundColor: '#fff7ec',
    borderWidth: 1,
    borderColor: '#dfd4c4',
  },
  actionLabel: {
    color: '#fefbf6',
    fontSize: 14,
    fontWeight: '700',
  },
  actionLabelSecondary: {
    color: '#6a4a24',
  },
  actionLabelGhost: {
    color: '#364454',
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  miniButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dfd4c4',
  },
  miniButtonDisabled: {
    backgroundColor: '#f1ede6',
  },
  miniButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5867',
  },
  miniButtonTextDisabled: {
    color: '#9aa3ab',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#5b6672',
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: '#182533',
  },
})
